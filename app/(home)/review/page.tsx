import { Container } from '@/components/layout/container';
import { LargeTitle } from '@/components/ios/tile';
import { ReviewClient } from './review-client';

export default function ReviewPage() {
  return (
    <Container className="py-12 md:py-16"><div className="mx-auto max-w-screen-md">
      <LargeTitle subtitle="Review your flashcards using spaced repetition.">
        Daily Review
      </LargeTitle>
      <ReviewClient />
    </div></Container>
  );
}
