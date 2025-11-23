import * as React from "react";
import type { LegendProps, TooltipProps } from "recharts";
import { Legend, Tooltip } from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = Record<string, { label?: string; color?: string }>;

type ChartConfigContextProps = {
  config: ChartConfig;
};

const ChartConfigContext = React.createContext<ChartConfigContextProps | null>(
  null,
);

const useChartConfig = () => {
  const context = React.useContext(ChartConfigContext);

  if (!context) {
    throw new Error("Chart components must be used within ChartContainer");
  }

  return context;
};

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig;
};

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ config, className, children, ...props }, ref) => {
    const colorVars = React.useMemo(() => {
      return Object.entries(config).reduce((acc, [key, value]) => {
        if (!value?.color) {
          return acc;
        }

        return {
          ...acc,
          [`--color-${key}`]: value.color,
        } as React.CSSProperties;
      }, {} as React.CSSProperties);
    }, [config]);

    return (
      <ChartConfigContext.Provider value={{ config }}>
        <div
          ref={ref}
          className={cn("h-full w-full", className)}
          style={colorVars}
          {...props}
        >
          {children}
        </div>
      </ChartConfigContext.Provider>
    );
  },
);
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = (props: TooltipProps<number, string>) => {
  return <Tooltip wrapperStyle={{ outline: "none" }} {...props} />;
};
ChartTooltip.displayName = "ChartTooltip";

type ChartTooltipContentProps = TooltipProps<number, string> & {
  indicator?: "line" | "dot";
  hideLabel?: boolean;
  hideIndicator?: boolean;
};

const ChartTooltipContent = ({
  active,
  payload,
  label,
  className,
  indicator = "dot",
  hideLabel,
  hideIndicator,
  labelFormatter,
  formatter,
}: ChartTooltipContentProps) => {
  const { config } = useChartConfig();

  if (!active || !payload?.length) {
    return null;
  }

  const tooltipLabel = hideLabel
    ? null
    : labelFormatter
      ? labelFormatter(label, payload)
      : label;

  return (
    <div
      className={cn(
        "min-w-[8rem] rounded-md border bg-popover px-3 py-2 text-sm shadow-md",
        className,
      )}
    >
      {tooltipLabel ? (
        <div className="mb-2 text-xs font-medium text-muted-foreground">
          {tooltipLabel}
        </div>
      ) : null}
      <div className="grid gap-1">
        {payload.map((item, index) => {
          const key = item.dataKey?.toString() ?? item.name ?? `item-${index}`;
          const itemConfig = key ? config[key] : null;
          const formattedValue = formatter
            ? formatter(item.value, item.name, item, index)
            : item.value;
          const [value, name] = Array.isArray(formattedValue)
            ? formattedValue
            : [formattedValue, itemConfig?.label ?? item.name ?? key];
          const color =
            itemConfig?.color ?? item.color ?? (key ? `var(--color-${key})` : undefined);

          return (
            <div
              key={key}
              className="flex items-center justify-between gap-4 text-foreground"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                {!hideIndicator && (
                  indicator === "line" ? (
                    <span
                      className="h-0.5 w-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ) : (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  )
                )}
                <span className="text-foreground">{name}</span>
              </div>
              <span className="font-medium">{value as React.ReactNode}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartLegend = (props: LegendProps) => {
  return <Legend {...props} />;
};
ChartLegend.displayName = "ChartLegend";

const ChartLegendContent = ({ payload }: LegendProps) => {
  const { config } = useChartConfig();

  if (!payload?.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      {payload.map((item) => {
        const key = item.dataKey?.toString() ?? item.value?.toString() ?? "legend-item";
        const itemConfig = key ? config[key] : null;
        const color = item.color ?? itemConfig?.color ?? (key ? `var(--color-${key})` : undefined);

        return (
          <div key={key} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <span>{itemConfig?.label ?? item.value}</span>
          </div>
        );
      })}
    </div>
  );
};
ChartLegendContent.displayName = "ChartLegendContent";

export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
};
