import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function HomeRootRedirect() {
    const cookieStore = await cookies();
    const defaultMode = cookieStore.get('default_media_mode')?.value || 'movie';

    switch (defaultMode) {
        case 'tv':
            redirect('/home/shows');
        case 'anime':
            redirect('/home/anime');
        default:
            redirect('/home/movies');
    }
}
