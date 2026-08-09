import UserProfile from "../../../../../../components/profile/user-profile";

export default async function UserPage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;

    return <UserProfile identifier={decodeURIComponent(userId)} />;
}
