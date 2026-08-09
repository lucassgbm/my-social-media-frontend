import UserProfile from "../../../../../../components/profile/user-profile";

export default async function FriendPage({
    params,
}: {
    params: Promise<{ friendId: string }>;
}) {
    const { friendId } = await params;

    return <UserProfile identifier={decodeURIComponent(friendId)} />;
}
