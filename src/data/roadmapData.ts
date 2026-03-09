export interface Task {
  type: "video" | "read" | "practice" | "project" | "checkpoint" | "quiz" | "rest";
  icon: string;
  title: string;
  duration?: string;
  source?: string;
  isFree?: boolean;
}

export interface Day {
  day: number;
  title: string;
  duration: string;
  isRest?: boolean;
  isToday?: boolean;
  tasks: Task[];
}

export interface Week {
  week: number;
  title: string;
  subtitle: string;
  icon: string;
  skills: string[];
  days: Day[];
}

export interface Resource {
  platform: string;
  title: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  price: string;
  isFree: boolean;
  rating: number;
  type: "video" | "project" | "course" | "reading";
}

export const weeks: Week[] = [
  {
    week: 1,
    title: "Foundation Fixes",
    subtitle: "Docker, Git Advanced, Linux basics",
    icon: "🔧",
    skills: ["Docker", "Git", "Linux"],
    days: [
      {
        day: 1, title: "Docker Basics", duration: "60 min", isToday: true,
        tasks: [
          { type: "video", icon: "🎥", title: '"Docker in 1 Hour" — TechWorld with Nana', duration: "45 min", source: "YouTube", isFree: true },
          { type: "read", icon: "📖", title: "Docker official quickstart", duration: "10 min" },
          { type: "practice", icon: "💻", title: "Run your first container", duration: "5 min" },
          { type: "checkpoint", icon: "✅", title: "Can you run a Hello World container?" },
        ],
      },
      {
        day: 2, title: "Docker Compose", duration: "60 min",
        tasks: [
          { type: "video", icon: "🎥", title: "Docker Compose tutorial", duration: "30 min", source: "YouTube", isFree: true },
          { type: "project", icon: "💻", title: "Dockerize a Node.js app", duration: "30 min" },
          { type: "checkpoint", icon: "✅", title: "Multi-container app running" },
        ],
      },
      {
        day: 3, title: "Rest & Review 😴", duration: "30 min", isRest: true,
        tasks: [
          { type: "rest", icon: "📝", title: "Light review of Day 1-2" },
          { type: "rest", icon: "🧠", title: "Anki flashcard review" },
          { type: "rest", icon: "💡", title: "Rest days are part of the plan!" },
        ],
      },
      {
        day: 4, title: "Git Advanced", duration: "60 min",
        tasks: [
          { type: "video", icon: "🎥", title: '"Git beyond the basics"', duration: "30 min", source: "YouTube", isFree: true },
          { type: "read", icon: "📖", title: "Git branching strategies", duration: "15 min" },
          { type: "practice", icon: "💻", title: "Resolve merge conflicts", duration: "15 min" },
          { type: "checkpoint", icon: "✅", title: "Can you rebase without fear?" },
        ],
      },
      {
        day: 5, title: "Linux Basics for Developers", duration: "60 min",
        tasks: [
          { type: "video", icon: "🎥", title: '"Linux command line for beginners"', duration: "40 min", source: "YouTube", isFree: true },
          { type: "read", icon: "📖", title: "Essential Linux commands cheat sheet", duration: "10 min" },
          { type: "practice", icon: "💻", title: "Navigate and manage files via terminal", duration: "10 min" },
          { type: "checkpoint", icon: "✅", title: "Can you grep, pipe, and ssh?" },
        ],
      },
      {
        day: 6, title: "Week 1 Project: Dockerized Web App", duration: "90 min",
        tasks: [
          { type: "project", icon: "💻", title: "Take a simple Node.js/React app" },
          { type: "project", icon: "🐳", title: "Add Dockerfile and docker-compose.yml" },
          { type: "checkpoint", icon: "✅", title: "App runs locally in containers" },
        ],
      },
      {
        day: 7, title: "Rest & Review 😴", duration: "30 min", isRest: true,
        tasks: [
          { type: "rest", icon: "📝", title: "Review Week 1 concepts" },
          { type: "rest", icon: "📊", title: "Update progress tracker" },
          { type: "rest", icon: "👀", title: "Preview Week 2: Cloud Essentials" },
        ],
      },
    ],
  },
  {
    week: 2,
    title: "Cloud Essentials",
    subtitle: "AWS fundamentals, S3, EC2",
    icon: "☁️",
    skills: ["AWS", "S3", "EC2", "CloudFormation"],
    days: [
      {
        day: 8, title: "AWS Account Setup + IAM", duration: "45 min",
        tasks: [
          { type: "video", icon: "🎥", title: "AWS Account creation & IAM deep dive", duration: "30 min", source: "YouTube", isFree: true },
          { type: "read", icon: "📖", title: "IAM best practices", duration: "10 min" },
          { type: "practice", icon: "💻", title: "Create users, groups, and roles", duration: "5 min" },
          { type: "checkpoint", icon: "✅", title: "Can you explain least privilege?" },
        ],
      },
      {
        day: 9, title: "S3 Storage Deep Dive", duration: "60 min",
        tasks: [
          { type: "video", icon: "🎥", title: "Amazon S3 complete guide", duration: "35 min", source: "YouTube", isFree: true },
          { type: "read", icon: "📖", title: "S3 storage classes", duration: "10 min" },
          { type: "practice", icon: "💻", title: "Host a static website on S3", duration: "15 min" },
          { type: "checkpoint", icon: "✅", title: "Static site is live" },
        ],
      },
      {
        day: 10, title: "EC2 Instances", duration: "60 min",
        tasks: [
          { type: "video", icon: "🎥", title: "EC2 fundamentals", duration: "30 min", source: "YouTube", isFree: true },
          { type: "read", icon: "📖", title: "Instance types and pricing", duration: "10 min" },
          { type: "practice", icon: "💻", title: "Launch and connect to EC2", duration: "20 min" },
          { type: "checkpoint", icon: "✅", title: "You can SSH into your instance" },
        ],
      },
      {
        day: 11, title: "AWS Project Day", duration: "90 min",
        tasks: [
          { type: "project", icon: "💻", title: "Deploy the Dockerized app from Week 1 to EC2" },
          { type: "project", icon: "🚀", title: "Configure security groups" },
          { type: "project", icon: "🌐", title: "Make it publicly accessible" },
          { type: "checkpoint", icon: "✅", title: "App runs on AWS" },
        ],
      },
      {
        day: 12, title: "CloudFormation Basics", duration: "60 min",
        tasks: [
          { type: "video", icon: "🎥", title: "Infrastructure as Code with CloudFormation", duration: "35 min", source: "YouTube", isFree: true },
          { type: "read", icon: "📖", title: "YAML/JSON templates", duration: "10 min" },
          { type: "practice", icon: "💻", title: "Write template to launch EC2", duration: "15 min" },
          { type: "checkpoint", icon: "✅", title: "Infrastructure deployed via code" },
        ],
      },
      {
        day: 13, title: "AWS Practice Test", duration: "45 min",
        tasks: [
          { type: "quiz", icon: "📝", title: "20-question quiz on AWS fundamentals" },
          { type: "read", icon: "📊", title: "Review incorrect answers" },
          { type: "practice", icon: "🔍", title: "Identify weak areas" },
        ],
      },
      {
        day: 14, title: "Rest & Review 😴", duration: "30 min", isRest: true,
        tasks: [
          { type: "rest", icon: "📝", title: "Review Week 2 concepts" },
          { type: "rest", icon: "📊", title: "Update progress tracker" },
          { type: "rest", icon: "👀", title: "Preview Week 3: ML Foundations" },
        ],
      },
    ],
  },
  {
    week: 3,
    title: "ML Foundations",
    subtitle: "Python ML, Scikit-learn, first model",
    icon: "🧠",
    skills: ["NumPy", "Pandas", "Scikit-learn", "ML"],
    days: [
      {
        day: 15, title: "Python for ML Refresher", duration: "60 min",
        tasks: [
          { type: "video", icon: "🎥", title: "Python for ML — NumPy & Pandas basics", duration: "40 min", source: "YouTube", isFree: true },
          { type: "practice", icon: "💻", title: "Basic data manipulation", duration: "20 min" },
          { type: "checkpoint", icon: "✅", title: "Can you load and inspect a CSV?" },
        ],
      },
      {
        day: 16, title: "Pandas & NumPy Deep Dive", duration: "60 min",
        tasks: [
          { type: "video", icon: "🎥", title: "Advanced Pandas — grouping, merging, pivoting", duration: "35 min", source: "YouTube", isFree: true },
          { type: "read", icon: "📖", title: "Pandas documentation examples", duration: "10 min" },
          { type: "practice", icon: "💻", title: "Data cleaning challenge", duration: "15 min" },
          { type: "checkpoint", icon: "✅", title: "Handle missing data like a pro" },
        ],
      },
      {
        day: 17, title: "Scikit-learn Basics", duration: "60 min",
        tasks: [
          { type: "video", icon: "🎥", title: "Intro to Scikit-learn", duration: "30 min", source: "YouTube", isFree: true },
          { type: "read", icon: "📖", title: "Model selection cheat sheet", duration: "10 min" },
          { type: "practice", icon: "💻", title: "Train your first classifier", duration: "20 min" },
          { type: "checkpoint", icon: "✅", title: "Model accuracy > 80%" },
        ],
      },
      {
        day: 18, title: "Your First ML Model", duration: "90 min",
        tasks: [
          { type: "project", icon: "💻", title: "Predict house prices with regression" },
          { type: "project", icon: "🧹", title: "Data preprocessing" },
          { type: "project", icon: "📊", title: "Train/test split" },
          { type: "project", icon: "📈", title: "Evaluate model performance" },
          { type: "checkpoint", icon: "✅", title: "Working ML model" },
        ],
      },
      {
        day: 19, title: "Model Evaluation", duration: "45 min",
        tasks: [
          { type: "video", icon: "🎥", title: "Confusion matrices, precision, recall", duration: "25 min", source: "YouTube", isFree: true },
          { type: "read", icon: "📖", title: "When accuracy isn't enough", duration: "10 min" },
          { type: "practice", icon: "💻", title: "Evaluate your Day 18 model properly", duration: "10 min" },
          { type: "checkpoint", icon: "✅", title: "Understand your model's weaknesses" },
        ],
      },
      {
        day: 20, title: "ML Project: Build Something Real", duration: "90 min",
        tasks: [
          { type: "project", icon: "💻", title: "Choose: Spam classifier / Movie recommender / Iris classifier" },
          { type: "project", icon: "🚀", title: "Deploy as simple Flask API" },
          { type: "checkpoint", icon: "✅", title: "End-to-end ML project complete" },
        ],
      },
      {
        day: 21, title: "Rest & Review 😴", duration: "30 min", isRest: true,
        tasks: [
          { type: "rest", icon: "📝", title: "Review Week 3 concepts" },
          { type: "rest", icon: "📊", title: "Update progress tracker" },
          { type: "rest", icon: "👀", title: "Preview Week 4: Interview Ready" },
        ],
      },
    ],
  },
  {
    week: 4,
    title: "Interview Ready",
    subtitle: "System Design, LeetCode, Mock interviews",
    icon: "🎯",
    skills: ["System Design", "LeetCode", "Interviews"],
    days: [
      {
        day: 22, title: "System Design Introduction", duration: "60 min",
        tasks: [
          { type: "video", icon: "🎥", title: "System Design basics — Load balancers, caching, databases", duration: "45 min", source: "YouTube", isFree: true },
          { type: "read", icon: "📖", title: "System Design primer", duration: "15 min" },
          { type: "checkpoint", icon: "✅", title: "Can you explain client-server architecture?" },
        ],
      },
      {
        day: 23, title: "Design a URL Shortener", duration: "60 min",
        tasks: [
          { type: "video", icon: "🎥", title: "Design TinyURL walkthrough", duration: "30 min", source: "YouTube", isFree: true },
          { type: "practice", icon: "📝", title: "Whiteboard design: API, database, scaling", duration: "30 min" },
          { type: "checkpoint", icon: "✅", title: "Complete design sketch" },
        ],
      },
      {
        day: 24, title: "Design a Social Media Feed", duration: "60 min",
        tasks: [
          { type: "video", icon: "🎥", title: "Design Twitter/Instagram feed", duration: "30 min", source: "YouTube", isFree: true },
          { type: "practice", icon: "📝", title: "Whiteboard: Pull vs push, caching strategies", duration: "30 min" },
          { type: "checkpoint", icon: "✅", title: "Feed architecture diagram" },
        ],
      },
      {
        day: 25, title: "LeetCode Easy 10 Problems", duration: "120 min",
        tasks: [
          { type: "practice", icon: "💻", title: "10 easy LeetCode problems" },
          { type: "practice", icon: "📝", title: "Focus: Arrays, strings, hash maps" },
          { type: "practice", icon: "⏱️", title: "Time yourself: 10-15 min per problem" },
          { type: "checkpoint", icon: "✅", title: "8/10 solved independently" },
        ],
      },
      {
        day: 26, title: "LeetCode Medium 5 Problems", duration: "120 min",
        tasks: [
          { type: "practice", icon: "💻", title: "5 medium LeetCode problems" },
          { type: "practice", icon: "📝", title: "Focus: Trees, graphs, dynamic programming" },
          { type: "practice", icon: "🧠", title: "Study solutions you couldn't solve" },
          { type: "checkpoint", icon: "✅", title: "3/5 solved independently" },
        ],
      },
      {
        day: 27, title: "Mock Interview Simulation", duration: "60 min",
        tasks: [
          { type: "video", icon: "🎥", title: "Watch a real mock interview", duration: "30 min", source: "YouTube", isFree: true },
          { type: "practice", icon: "💻", title: "Solve a problem aloud with timer", duration: "30 min" },
          { type: "checkpoint", icon: "✅", title: "You explained your thinking clearly" },
        ],
      },
      {
        day: 28, title: "Resume Update with New Skills", duration: "60 min",
        tasks: [
          { type: "project", icon: "📄", title: "Add Docker, AWS, ML projects to resume" },
          { type: "project", icon: "🔄", title: "Update LinkedIn with new skills" },
          { type: "project", icon: "✨", title: "Write bullet points using STAR method" },
          { type: "checkpoint", icon: "✅", title: "Resume ready for applications" },
        ],
      },
      {
        day: 29, title: "Apply to 5 Target Companies", duration: "60 min",
        tasks: [
          { type: "project", icon: "🎯", title: "Research companies hiring for your target role" },
          { type: "project", icon: "📝", title: "Customize resume for each application" },
          { type: "project", icon: "🔗", title: "Submit applications" },
          { type: "checkpoint", icon: "✅", title: "5 applications submitted" },
        ],
      },
      {
        day: 30, title: "🎉 Completion Day!", duration: "30 min",
        tasks: [
          { type: "rest", icon: "🏆", title: "Celebrate your 30-day journey" },
          { type: "quiz", icon: "📊", title: "Take final readiness assessment" },
          { type: "rest", icon: "🔮", title: 'Preview: "Next 30 days" — advanced topics' },
          { type: "rest", icon: "📣", title: "Share your success on LinkedIn" },
          { type: "checkpoint", icon: "✅", title: "You're interview-ready!" },
        ],
      },
    ],
  },
];

export const resources: Resource[] = [
  { platform: "YouTube", title: "Docker in 1 Hour — TechWorld with Nana", duration: "1h", difficulty: "Beginner", price: "Free", isFree: true, rating: 4.9, type: "video" },
  { platform: "YouTube", title: "AWS Cloud Practitioner Full Course", duration: "4h", difficulty: "Beginner", price: "Free", isFree: true, rating: 4.8, type: "video" },
  { platform: "Coursera", title: "Machine Learning by Andrew Ng", duration: "11 weeks", difficulty: "Intermediate", price: "₹2,499/mo", isFree: false, rating: 4.9, type: "course" },
  { platform: "YouTube", title: "System Design Interview Guide", duration: "2h", difficulty: "Intermediate", price: "Free", isFree: true, rating: 4.7, type: "video" },
  { platform: "LeetCode", title: "Top 100 Interview Questions", duration: "Self-paced", difficulty: "Intermediate", price: "Free", isFree: true, rating: 4.8, type: "project" },
  { platform: "Udemy", title: "Docker & Kubernetes Complete Guide", duration: "22h", difficulty: "Beginner", price: "₹999", isFree: false, rating: 4.7, type: "course" },
  { platform: "GitHub", title: "System Design Primer", duration: "Self-paced", difficulty: "Advanced", price: "Free", isFree: true, rating: 4.9, type: "reading" },
  { platform: "freeCodeCamp", title: "Scientific Computing with Python", duration: "10h", difficulty: "Beginner", price: "Free", isFree: true, rating: 4.6, type: "video" },
  { platform: "Kaggle", title: "Intro to Machine Learning", duration: "3h", difficulty: "Beginner", price: "Free", isFree: true, rating: 4.5, type: "project" },
  { platform: "Udemy", title: "AWS Certified Solutions Architect", duration: "30h", difficulty: "Intermediate", price: "₹2,499", isFree: false, rating: 4.8, type: "course" },
];
