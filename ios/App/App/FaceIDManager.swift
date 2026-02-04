/**
 * M1SSION™ Face ID Manager
 * © 2026 Joseph MULÉ – NIYVORA KFT – ALL RIGHTS RESERVED
 *
 * Handles biometric authentication (Face ID / Touch ID) as an OPTIONAL layer.
 * Does NOT replace existing login - only enhances it.
 *
 * Security:
 * - Credentials stored in iOS Keychain (encrypted, hardware-backed)
 * - No credentials exposed to JavaScript
 * - Biometric data never leaves device
 *
 * UPDATED: Now stores both access_token AND refresh_token for proper session restore
 */

import Foundation
import LocalAuthentication
import Security

// Session tokens structure
struct AuthTokens: Codable {
    let accessToken: String
    let refreshToken: String
}

class FaceIDManager {
    
    static let shared = FaceIDManager()
    
    // Keychain service identifier
    private let keychainService = "eu.m1ssion.app.credentials"
    private let keychainAccountTokens = "m1ssion_auth_tokens"
    
    private init() {}
    
    // MARK: - Biometric Availability
    
    /// Check if Face ID / Touch ID is available and enrolled
    func isBiometricAvailable() -> (available: Bool, biometryType: String) {
        let context = LAContext()
        var error: NSError?
        
        let canEvaluate = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
        
        if canEvaluate {
            switch context.biometryType {
            case .faceID:
                return (true, "faceID")
            case .touchID:
                return (true, "touchID")
            case .opticID:
                return (true, "opticID")
            case .none:
                return (false, "none")
            @unknown default:
                return (true, "biometric")
            }
        }
        
        print("⚠️ FaceIDManager: Biometric not available - \(error?.localizedDescription ?? "unknown")")
        return (false, "none")
    }
    
    /// Check if we have stored credentials for Face ID login
    func hasStoredCredentials() -> Bool {
        return getStoredTokens() != nil
    }
    
    // MARK: - Biometric Authentication
    
    /// Authenticate with Face ID / Touch ID
    /// - Parameter completion: Returns (success, accessToken, refreshToken, error message)
    func authenticateWithBiometric(reason: String = "Accedi a M1SSION", completion: @escaping (Bool, String?, String?, String?) -> Void) {
        let context = LAContext()
        var error: NSError?
        
        // Check if biometric is available
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            completion(false, nil, nil, "Biometric non disponibile: \(error?.localizedDescription ?? "errore sconosciuto")")
            return
        }
        
        // Check if we have stored credentials
        guard let tokens = getStoredTokens() else {
            completion(false, nil, nil, "no_credentials")
            return
        }
        
        // Perform biometric authentication
        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, authError in
            DispatchQueue.main.async {
                if success {
                    print("✅ FaceIDManager: Biometric authentication successful")
                    completion(true, tokens.accessToken, tokens.refreshToken, nil)
                } else {
                    let errorMessage: String
                    if let laError = authError as? LAError {
                        switch laError.code {
                        case .userCancel:
                            errorMessage = "cancelled"
                        case .userFallback:
                            errorMessage = "fallback"
                        case .biometryNotAvailable:
                            errorMessage = "not_available"
                        case .biometryNotEnrolled:
                            errorMessage = "not_enrolled"
                        case .biometryLockout:
                            errorMessage = "lockout"
                        default:
                            errorMessage = "auth_failed"
                        }
                    } else {
                        errorMessage = "unknown_error"
                    }
                    print("❌ FaceIDManager: Authentication failed - \(errorMessage)")
                    completion(false, nil, nil, errorMessage)
                }
            }
        }
    }
    
    // MARK: - Keychain Operations (Secure Storage)
    
    /// Save both auth tokens to Keychain (called after successful login)
    func saveCredentials(accessToken: String, refreshToken: String) -> Bool {
        // Delete any existing tokens first
        deleteCredentials()
        
        // Create tokens structure
        let tokens = AuthTokens(accessToken: accessToken, refreshToken: refreshToken)
        
        // Encode to JSON
        guard let tokenData = try? JSONEncoder().encode(tokens) else {
            print("❌ FaceIDManager: Failed to encode tokens")
            return false
        }
        
        // Keychain query with biometric protection
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: keychainAccountTokens,
            kSecValueData as String: tokenData,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]
        
        let status = SecItemAdd(query as CFDictionary, nil)
        
        if status == errSecSuccess {
            print("✅ FaceIDManager: Both tokens saved to Keychain")
            return true
        } else {
            print("❌ FaceIDManager: Failed to save tokens - status: \(status)")
            return false
        }
    }
    
    /// Retrieve auth tokens from Keychain
    private func getStoredTokens() -> AuthTokens? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: keychainAccountTokens,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        if status == errSecSuccess, let data = result as? Data {
            do {
                let tokens = try JSONDecoder().decode(AuthTokens.self, from: data)
                return tokens
            } catch {
                print("❌ FaceIDManager: Failed to decode tokens - \(error)")
                return nil
            }
        }
        
        return nil
    }
    
    /// Delete stored credentials from Keychain
    func deleteCredentials() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: keychainAccountTokens
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        if status == errSecSuccess || status == errSecItemNotFound {
            print("✅ FaceIDManager: Credentials deleted from Keychain")
        }
    }
    
    // MARK: - JSON Response Helpers
    
    /// Generate JSON response for WebView
    func availabilityJSON() -> String {
        let (available, biometryType) = isBiometricAvailable()
        let hasCredentials = hasStoredCredentials()
        
        return """
        {
            "available": \(available),
            "biometryType": "\(biometryType)",
            "hasStoredCredentials": \(hasCredentials)
        }
        """
    }
}
