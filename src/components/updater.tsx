import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import { AlertCircle, CheckCircle, Download, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { DropdownMenuItem } from "./ui/dropdown-menu";

interface UpdaterProps {
  checkOnMount?: boolean;
}

export function Updater({ checkOnMount = true }: UpdaterProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateInfo, setUpdateInfo] = useState<{
    currentVersion: string;
    version: string;
    body?: string;
  } | null>(null);

  const checkForUpdate = async () => {
    try {
      setChecking(true);
      setError(null);

      const update = await check();

      if (update) {
        setUpdateAvailable(true);
        setUpdateInfo({
          currentVersion: update.currentVersion,
          version: update.version,
          body: update.body,
        });
        console.log("Update available:", update.version);
      } else {
        setUpdateAvailable(false);
        toast.success("App is up to date");
        console.log("App is up to date");
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
      toast.error("Failed to check for updates");
      setError("Failed to check for updates");
    } finally {
      setChecking(false);
    }
  };

  const installUpdate = async () => {
    try {
      setDownloading(true);
      setError(null);

      const update = await check();
      if (!update) {
        toast.error("No update available");
        setError("No update available");
        return;
      }

      let downloaded = 0;
      let contentLength = 0;

      // Download and install the update
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength || 0;
            console.log(
              `Started downloading ${event.data.contentLength} bytes`
            );
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            const progress =
              contentLength > 0 ? (downloaded / contentLength) * 100 : 0;
            console.log(
              `Downloaded ${downloaded} of ${contentLength} bytes (${progress.toFixed(
                1
              )}%)`
            );
            break;
          case "Finished":
            console.log("Download finished");
            break;
        }
      });

      toast.success("Update installed! Restarting app...");
      console.log("Update installed, restarting app...");
      await relaunch();
    } catch (error) {
      console.error("Failed to install update:", error);
      toast.error("Failed to install update");
      setError("Failed to install update");
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (checkOnMount) {
      checkForUpdate();
    }
  }, [checkOnMount]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Update Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (updateAvailable && updateInfo) {
    return (
      <Alert>
        <Download className="h-4 w-4" />
        <AlertTitle>Update Available</AlertTitle>
        <AlertDescription>
          <div className="space-y-2">
            <p>
              Version {updateInfo.version} is available (current:{" "}
              {updateInfo.currentVersion})
            </p>
            {updateInfo.body && (
              <div className="text-sm text-muted-foreground">
                <strong>What's new:</strong>
                <div className="mt-1 whitespace-pre-line">
                  {updateInfo.body}
                </div>
              </div>
            )}
            <Button
              onClick={installUpdate}
              disabled={downloading}
              size="sm"
              className="mt-2"
            >
              {downloading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Install Update
                </>
              )}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <DropdownMenuItem onClick={checkForUpdate} disabled={checking}>
      {checking ? (
        <>
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Checking...
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Check for Updates
        </>
      )}
    </DropdownMenuItem>
  );
}
