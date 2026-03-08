import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Legend
} from "recharts";

const data = [
  { subject: "Programming", you: 75, required: 90 },
  { subject: "Databases", you: 80, required: 85 },
  { subject: "Cloud", you: 20, required: 80 },
  { subject: "ML/AI", you: 15, required: 70 },
  { subject: "System Design", you: 30, required: 85 },
  { subject: "Soft Skills", you: 70, required: 75 },
];

const SkillRadar = () => (
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

export default SkillRadar;
