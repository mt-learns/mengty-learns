import { LargeTitle } from '@/components/ios/tile';
import { ReviewClient } from './review-client';

export default function ReviewPage() {
  return (
    <div className="container max-w-screen-md px-4 py-12">
      <LargeTitle subtitle="Review your flashcards using spaced repetition.">
        Daily Review
      </LargeTitle>
      <ReviewClient />
    </div>
  );
}
