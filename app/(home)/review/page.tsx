import { LargeTitle } from '@/components/ios/tile';
import { ReviewClient } from './review-client';
import fs from 'node:fs';
import path from 'node:path';

export default function ReviewPage() {
  let cards = [];
  try {
    const cardsPath = path.join(process.cwd(), 'public', 'cards.json');
    if (fs.existsSync(cardsPath)) {
      cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
    }
  } catch (e) {
    cards = [];
  }

  return (
    <div className="container max-w-screen-md px-4 py-12">
      <LargeTitle subtitle="Review your flashcards using spaced repetition.">
        Daily Review
      </LargeTitle>
      <ReviewClient cards={cards} />
    </div>
  );
}
