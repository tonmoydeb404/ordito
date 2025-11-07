import {
  ThemeAnimationType,
  useModeAnimation,
} from "react-theme-switch-animation";

export function ThemeToggle() {
  const { ref, toggleSwitchTheme, isDarkMode } = useModeAnimation({
    animationType: ThemeAnimationType.CIRCLE,
  });

  return (
    <button ref={ref} onClick={toggleSwitchTheme}>
      {isDarkMode ? "🌙" : "☀️"}
    </button>
  );
}
