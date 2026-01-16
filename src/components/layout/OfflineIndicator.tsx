import { useOffline } from '@/hooks/useOffline';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingChanges, syncNow, lastSyncTime } = useOffline();

  return (
    <div className="flex items-center gap-2">
      {pendingChanges > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="gap-1">
              <Cloud className="h-3 w-3" />
              {pendingChanges} pending
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{pendingChanges} changes waiting to sync</p>
            {lastSyncTime && (
              <p className="text-xs text-muted-foreground">
                Last sync: {lastSyncTime.toLocaleTimeString()}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              isOnline
                ? 'bg-success/20 text-success'
                : 'bg-warning/20 text-warning'
            }`}
          >
            {isOnline ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isOnline ? 'Online' : 'Offline - Changes will sync when back online'}</p>
        </TooltipContent>
      </Tooltip>

      {isOnline && pendingChanges > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={syncNow}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sync now</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
