import UserProfile from "../../../../../../components/profile/user-profile";

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ profileId: string }>;
}) {
    const { profileId } = await params;

    return <UserProfile profileName={decodeURIComponent(profileId)} />;
}
