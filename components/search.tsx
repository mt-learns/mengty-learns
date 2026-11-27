'use client';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { useStaticSearch } from 'fumadocs-core/search/client';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/components/pwa/use-online';

export default function DefaultSearchDialog(props: SharedProps) {
  const { locale } = useI18n(); // (optional) for i18n
  const isOnline = useOnlineStatus();
  const search = useStaticSearch({
    locale,
  });

  const isOfflineUnavailable = !isOnline && Boolean(search.error);

  return (
    <SearchDialog {...search} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        {!isOnline && !isOfflineUnavailable && (
          <div className="flex items-center gap-2 border-t px-4 py-2 text-caption-1 text-muted-foreground">
            <WifiOff className="size-3.5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <span>Offline — search works only if the index was already cached online.</span>
          </div>
        )}
        {isOfflineUnavailable ? (
          <div className="flex items-start gap-2.5 border-t px-4 py-4 text-subheadline text-muted-foreground">
            <WifiOff className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <span>
              Search needs a connection the first time you open it. You can still browse cached pages or review flashcards.
            </span>
          </div>
        ) : (
          <SearchDialogList />
        )}
      </SearchDialogContent>
    </SearchDialog>
  );
}
