
import { fetchMovieRecommendations } from "@/lib/tmdb";
import { MoviesCarousel } from "@/components/MoviesCarousel";

export async function RecommendedMovies({ movieId, mediaType = 'movie' }: { movieId: number, mediaType?: 'movie' | 'tv' }) {
    const recommendations = await fetchMovieRecommendations(movieId, 1, mediaType);
    return <MoviesCarousel title="You Might Also Like" movies={recommendations} />;
}
