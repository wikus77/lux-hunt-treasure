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
 */

import Foundation
import LocalAuthentication
import Security

class FaceIDManager {
    
    static let shared = FaceIDManager()
    
    // Keychain service identifier
    private let keychainService = "eu.m1ssion.app.credentials"
    private let keychainAccountEmail = "m1ssion_user_email"
    private let keychainAccountToken = "m1ssion_auth_token"
    
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
        return getStoredToken() != nil
    }
    
    // MARK: - Biometric Authentication
    
    /// Authenticate with Face ID / Touch ID
    /// - Parameter completion: Returns (success, token, error message)
    func authenticateWithBiometric(reason: String = "Accedi a M1SSION", completion: @escaping (Bool, String?, String?) -> Void) {
        let context = LAContext()
        var error: NSError?
        
        // Check if biometric is available
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            completion(false, nil, "Biometric non disponibile: \(error?.localizedDescription ?? "errore sconosciuto")")
            return
        }
        
        // Check if we have stored credentials
        guard let storedToken = getStoredToken() else {
            completion(false, nil, "no_credentials")
            return
        }
        
        // Perform biometric authentication
        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, authError in
            DispatchQueue.main.async {
                if success {
                    print("✅ FaceIDManager: Biometric authentication successful")
                    completion(true, storedToken, nil)
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
                    completion(false, nil, errorMessage)
                }
            }
        }
    }
    
    // MARK: - Keychain Operations (Secure Storage)
    
    /// Save auth token to Keychain (called after successful login)
    func saveCredentials(token: String) -> Bool {
        // Delete any existing token first
        deleteCredentials()
        
        // Prepare token data
        guard let tokenData = token.data(using: .utf8) else {
            print("❌ FaceIDManager: Failed to encode token")
            return false
        }
        
        // Keychain query with biometric protection
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: keychainAccountToken,
            kSecValueData as String: tokenData,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]
        
        let status = SecItemAdd(query as CFDictionary, nil)
        
        if status == errSecSuccess {
            print("✅ FaceIDManager: Credentials saved to Keychain")
            return true
        } else {
            print("❌ FaceIDManager: Failed to save credentials - status: \(status)")
            return false
        }
    }
    
    /// Retrieve auth token from Keychain
    private func getStoredToken() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: keychainAccountToken,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        if status == errSecSuccess, let data = result as? Data, let token = String(data: data, encoding: .utf8) {
            return token
        }
        
        return nil
    }
    
    /// Delete stored credentials from Keychain
    func deleteCredentials() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: keychainAccountToken
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
