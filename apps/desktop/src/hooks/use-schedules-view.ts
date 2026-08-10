import { useOrdito } from "@/context/ordito-context";
import { useEffect, useMemo } from "react";

export function useSchedulesView() {
  const { activeSchedules, pausedSchedules, selectedSchedule, selectSchedule } =
    useOrdito();

  const orderedSchedules = useMemo(
    () => [...activeSchedules, ...pausedSchedules],
    [activeSchedules, pausedSchedules],
  );

  // Keep selection anchored to a visible schedule when the list narrows.
  useEffect(() => {
    const selectedId = selectedSchedule?.id ?? null;
    if (selectedId === null) return;
    const isSelectedVisible = orderedSchedules.some(
      (schedule) => schedule.id === selectedId,
    );
    if (!isSelectedVisible) {
      selectSchedule(orderedSchedules[0]?.id ?? null);
    }
  }, [orderedSchedules, selectedSchedule, selectSchedule]);

  return { orderedSchedules };
}
