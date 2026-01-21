
import ActivityKit
import Capacitor
import Foundation

@objc(M1SSIONLiveActivity)
public class M1SSIONLiveActivity: CAPPlugin {
    private var currentActivity: Activity<M1SSIONAttributes>?
    
    @objc func startActivity(_ call: CAPPluginCall) {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            call.reject("Live Activities non abilitate")
            return
        }
        
        let missionId = call.getString("data.missionId") ?? "mission-\(Date().timeIntervalSince1970)"
        let status = call.getString("data.status") ?? "Missione Attiva"
        let progress = call.getInt("data.progress") ?? 0
        let timeLeft = call.getInt("data.timeLeft") ?? 0
        
        let attributes = M1SSIONAttributes(missionId: missionId)
        let contentState = M1SSIONAttributes.ContentState(
            status: status,
            progress: progress,
            timeLeft: timeLeft,
            lastUpdated: Date()
        )
        
        do {
            currentActivity = try Activity<M1SSIONAttributes>.request(
                attributes: attributes,
                contentState: contentState,
                pushType: nil
            )
            
            print("✅ M1SSION Live Activity started: \(missionId)")
            call.resolve(["success": true])
            
        } catch {
            print("❌ Error starting Live Activity: \(error.localizedDescription)")
            call.reject("Errore avvio Live Activity: \(error.localizedDescription)")
        }
    }
    
    @objc func updateActivity(_ call: CAPPluginCall) {
        guard let activity = currentActivity else {
            call.reject("Nessuna Live Activity attiva da aggiornare")
            return
        }
        
        let status = call.getString("status") ?? "Missione Attiva"
        let progress = call.getInt("progress") ?? 0
        let timeLeft = call.getInt("timeLeft") ?? 0
        
        let updatedState = M1SSIONAttributes.ContentState(
            status: status,
            progress: progress,
            timeLeft: timeLeft,
            lastUpdated: Date()
        )
        
        Task {
            await activity.update(using: updatedState)
            print("🔄 M1SSION Live Activity updated")
            call.resolve(["success": true])
        }
    }
    
    @objc func endActivity(_ call: CAPPluginCall) {
        guard let activity = currentActivity else {
            call.reject("Nessuna Live Activity attiva da terminare")
            return
        }
        
        Task {
            await activity.end(dismissalPolicy: .immediate)
            currentActivity = nil
            print("🛑 M1SSION Live Activity ended")
            call.resolve(["success": true])
        }
    }
}
