
import FormContainer from "./pre-registration/FormContainer";
import RegistrationForm from "./pre-registration/RegistrationForm";
import SuccessView from "./pre-registration/SuccessView";
import { usePreRegistration } from "./pre-registration/usePreRegistration";

interface PreRegistrationFormProps {
  className?: string;
}

const PreRegistrationForm = ({ className }: PreRegistrationFormProps) => {
  const {
    name,
    setName,
    email,
    setEmail,
    inviteCode,
    setInviteCode,
    isSubmitting,
    isSubmitted,
    userReferralCode,
    showInviteOptions,
    setShowInviteOptions,
    showReferralInput,
    setShowReferralInput,
    formErrors,
    handleSubmit,
    handleInviteCodeSubmit,
    copyReferralCode,
    shareViaEmail
  } = usePreRegistration();

  // Handler functions for UI interactions
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => setInviteCode(e.target.value);
  const handleInviteFriend = () => setShowInviteOptions(true);
  const handleShowReferralInput = () => setShowReferralInput(true);
  const handleInviteOptionsBack = () => setShowInviteOptions(false);
  const handleReferralInputCancel = () => setShowReferralInput(false);

  return (
    <FormContainer className={className} id="pre-registration-form">
      {!isSubmitted ? (
        <RegistrationForm 
          name={name}
          email={email}
          isSubmitting={isSubmitting}
          formErrors={formErrors}
          onNameChange={handleNameChange}
          onEmailChange={handleEmailChange}
          onSubmit={handleSubmit}
        />
      ) : (
        <SuccessView 
          userReferralCode={userReferralCode}
          showInviteOptions={showInviteOptions}
          showReferralInput={showReferralInput}
          inviteCode={inviteCode}
          isSubmitting={isSubmitting}
          onInviteCodeChange={handleInviteCodeChange}
          onCopyReferralCode={copyReferralCode}
          onInviteOptionToggle={handleInviteFriend}
          onShowReferralInput={handleShowReferralInput}
          onShareViaEmail={shareViaEmail}
          onInviteCodeSubmit={handleInviteCodeSubmit}
          onInviteOptionsBack={handleInviteOptionsBack}
          onReferralInputCancel={handleReferralInputCancel}
        />
      )}
    </FormContainer>
  );
};

export default PreRegistrationForm;
