import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import SubscriptionStatus from "@/components/profile/SubscriptionStatus";

interface ProfileBioProps {
  name: string;
  setName: (name: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  profileImage: string | null;
  setProfileImage: (profileImage: string | null) => void;
  isEditing: boolean;
  onSave: () => void;
}

const ProfileBio = ({ name, setName, bio, setBio, profileImage, setProfileImage, isEditing, onSave }) => {
  return (
    <div className="w-full px-4">
      <div className="flex flex-col items-center mb-4">
        <Avatar className="w-32 h-32 relative">
          <AvatarImage src={profileImage} alt="Profile" className="object-cover" />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        {isEditing && (
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setProfileImage(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="mt-2 text-sm"
          />
        )}
      </div>

      {isEditing ? (
        <>
          <Input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-2"
          />
          <Textarea
            placeholder="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mb-2"
          />
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-2">{name}</h2>
          <p className="text-gray-400">{bio}</p>
        </>
      )}
      
      <div className="mt-4">
        <SubscriptionStatus />
      </div>
    </div>
  );
};

export default ProfileBio;
