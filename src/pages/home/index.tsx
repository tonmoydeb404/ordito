import ReportsSection from "./reports";
import StatsSection from "./stats";

type Props = {};

const HomePage = (_props: Props) => {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <StatsSection />
      <div className="px-4 lg:px-6">
        <ReportsSection />
      </div>
    </div>
  );
};

export default HomePage;
