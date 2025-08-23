import RecentCommandsSection from "./recent-commands";
import ReportsSection from "./reports";
import StatsSection from "./stats";
import TodaySchedulesSection from "./today-schedules";

type Props = {};

const HomePage = (_props: Props) => {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <StatsSection />

      <div className="w-full px-4 lg:px-6 grid grid-cols-1 @4xl/main:grid-cols-2 gap-4">
        <TodaySchedulesSection />
        <RecentCommandsSection />
      </div>

      <div className="px-4 lg:px-6">
        <ReportsSection />
      </div>
    </div>
  );
};

export default HomePage;
