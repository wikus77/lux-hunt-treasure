
import { toast } from "sonner";
import { testSendAgentConfirmation } from "@/services/agentRegistrationService";

/**
 * Utility function to test the agent confirmation email
 * This can be run from the browser console for debugging
 * 
 * Usage: 
 * 1. Import in any file that needs testing: import '@/utils/emailTestUtility'
 * 2. Call from browser console: window.testAgentEmail('test@example.com')
 */
export const testAgentEmail = async (email: string, name: string = "Test Agent") => {
  console.log(`📧 Testing agent email to: ${email}`);
  
  try {
    const result = await testSendAgentConfirmation(email, name);
    
    if (result) {
      console.log("✅ Test email sent successfully!");
      console.log("✓ Using Mailjet TemplateID: 6974914");
      console.log("✓ Check email From field to verify sender is noreply@m1ssion.com");
      toast.success("Test email sent", {
        description: `Confirmation email sent to ${email}`
      });
      return true;
    } else {
      console.error("❌ Failed to send test email");
      toast.error("Test email failed", {
        description: "Failed to send test email. Check console for details."
      });
      return false;
    }
  } catch (error) {
    console.error("❌ Error testing email:", error);
    toast.error("Test email error", {
      description: error instanceof Error ? error.message : "Unknown error"
    });
    return false;
  }
};

// Make the function available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).testAgentEmail = testAgentEmail;
}

// Export for direct usage in tests
export default testAgentEmail;
