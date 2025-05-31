import { toast } from "sonner";

/**
 * Copy text to clipboard with toast feedback
 * @param text - Text to copy to clipboard
 * @param successMessage - Custom success message (optional)
 * @param errorMessage - Custom error message (optional)
 * @returns Promise<boolean> - Success status
 */
export async function copyToClipboard(
  text: string,
  successMessage?: string,
  errorMessage?: string
): Promise<boolean> {
  try {
    // Modern Clipboard API (preferred)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage || "Copied to clipboard!");
      return true;
    }

    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      toast.success(successMessage || "Copied to clipboard!");
      return true;
    } else {
      throw new Error("Copy command failed");
    }
  } catch (err) {
    console.error("Failed to copy text: ", err);
    toast.error(errorMessage || "Failed to copy to clipboard");
    return false;
  }
}

/**
 * Copy command text to clipboard
 * @param command - Command object or command string
 */
export async function copyCommand(
  command: string | { label: string; cmd: string }
) {
  const text = typeof command === "string" ? command : command.cmd;
  const label = typeof command === "string" ? "Command" : command.label;

  return copyToClipboard(
    text,
    `${label} copied to clipboard!`,
    `Failed to copy ${label.toLowerCase()}`
  );
}

/**
 * Copy all commands from a group as a formatted list
 * @param commands - Array of command objects
 * @param groupTitle - Title of the group
 */
export async function copyGroupCommands(
  commands: Array<{ label: string; cmd: string; is_detached?: boolean }>,
  groupTitle?: string
) {
  if (commands.length === 0) {
    toast.error("No commands to copy");
    return false;
  }

  const formatted = commands
    .map((cmd, index) => {
      const detachedNote = cmd.is_detached ? " (detached)" : "";
      return `${index + 1}. ${cmd.label}${detachedNote}\n   ${cmd.cmd}`;
    })
    .join("\n\n");

  const header = groupTitle ? `# ${groupTitle} Commands\n\n` : "# Commands\n\n";
  const text = header + formatted;

  return copyToClipboard(
    text,
    `${commands.length} command${commands.length !== 1 ? "s" : ""} copied!`,
    "Failed to copy commands"
  );
}

/**
 * Copy group data as JSON
 * @param group - Group object
 */
export async function copyGroupAsJSON(group: {
  id: string;
  title: string;
  commands: Array<{
    id: string;
    label: string;
    cmd: string;
    is_detached?: boolean;
  }>;
}) {
  const jsonText = JSON.stringify(group, null, 2);

  return copyToClipboard(
    jsonText,
    `Group "${group.title}" copied as JSON!`,
    "Failed to copy group data"
  );
}

/**
 * Copy multiple groups as JSON
 * @param groups - Array of group objects
 */
export async function copyAllGroupsAsJSON(
  groups: Array<{
    id: string;
    title: string;
    commands: Array<{
      id: string;
      label: string;
      cmd: string;
      is_detached?: boolean;
    }>;
  }>
) {
  const exportData = {
    exported_at: new Date().toISOString(),
    groups: groups,
  };

  const jsonText = JSON.stringify(exportData, null, 2);

  return copyToClipboard(
    jsonText,
    `${groups.length} group${groups.length !== 1 ? "s" : ""} copied as JSON!`,
    "Failed to copy groups data"
  );
}

/**
 * Copy commands as shell script
 * @param commands - Array of command objects
 * @param groupTitle - Title for the script
 */
export async function copyAsShellScript(
  commands: Array<{ label: string; cmd: string; is_detached?: boolean }>,
  groupTitle?: string
) {
  if (commands.length === 0) {
    toast.error("No commands to copy");
    return false;
  }

  const header = `#!/bin/bash\n# ${
    groupTitle || "Commands"
  } Script\n# Generated on ${new Date().toLocaleString()}\n\n`;

  const script = commands
    .map((cmd) => {
      const comment = `# ${cmd.label}`;
      const command = cmd.is_detached ? `${cmd.cmd} &` : cmd.cmd;
      return `${comment}\n${command}`;
    })
    .join("\n\n");

  const fullScript = header + script + "\n\n# End of script\n";

  return copyToClipboard(
    fullScript,
    "Shell script copied to clipboard!",
    "Failed to copy shell script"
  );
}
