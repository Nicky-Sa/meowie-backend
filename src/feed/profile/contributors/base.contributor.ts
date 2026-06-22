import { FeedProfileContribution } from '@/feed/profile/profile.types';

export abstract class BaseContributor {
  abstract contribute(userId: number): Promise<FeedProfileContribution>;
}
