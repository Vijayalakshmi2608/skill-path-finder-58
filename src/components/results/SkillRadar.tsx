import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Legend
} from "recharts";

interface SkillRadarProps {
  radarData?: { axis: string; required: number; current: number }[];
}

const SkillRadar = ({ radarData }: SkillRadarProps) => {
  const data = radarData && radarData.length > 0
    ? radarData.map(d => ({ subject: d.axis, you: d.current, required: d.required }))
    : [];

  if (data.length === 0) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="text-muted-foreground">No radar data available. Complete the analysis first.</p>
      </div>
    );
  }

  return (
    <div className="card-surface p-6">
      <h3 className="text-xl font-heading font-bold text-foreground mb-6">Skills Radar — You vs. Required</h3>
      <div className="w-full h-[400px]">
        <ResponsiveContainer>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="hsl(240, 16%, 19%)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12, fontFamily: "Outfit" }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 10 }}
              axisLine={false}
            />
            <Radar
              name="Required Level"
              dataKey="required"
              stroke="hsl(217, 91%, 60%)"
              fill="hsl(217, 91%, 60%)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Radar
              name="Your Level"
              dataKey="you"
              stroke="hsl(160, 84%, 39%)"
              fill="hsl(160, 84%, 39%)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Legend
              wrapperStyle={{ fontFamily: "Outfit", fontSize: 13, color: "hsl(215, 20%, 65%)" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">
        The <span className="text-destructive">gap</span> between the blue and green areas shows where you need to improve
      </p>
    </div>
  );
};

export default SkillRadar;