import { BlockData } from "../types";
import { v4 as uuidv4 } from 'uuid';

export const generateBlockFromPrompt = async (prompt: string, centerPos: {x: number, y: number}): Promise<BlockData | null> => {
  // Simulate "thinking" delay to feel like AI
  await new Promise(resolve => setTimeout(resolve, 600));

  const p = prompt.toLowerCase();
  
  // Extract a number for row/item counts (default to 3)
  const numMatch = p.match(/(\d+)/);
  let count = numMatch ? parseInt(numMatch[0]) : 3;
  // Safety caps
  if (count > 20) count = 20;
  if (count < 1) count = 1;

  let type: any = 'text';
  let title = '📝 Note';
  let content: any = '';
  let category: any = 'general';
  let w = 240;
  let h = 120;

  // -- Logic Branching --

  // 1. Fitness / Gym (Table)
  if (p.match(/(gym|fitness|workout|exercise|lift|train|muscle|cardio|sport|weight)/)) {
    type = 'table';
    title = '💪 Workout Plan';
    category = 'fitness';
    
    const rows = [];
    const sampleExercises = ['Warmup', 'Squats', 'Bench Press', 'Deadlift', 'Overhead Press', 'Pullups', 'Dips', 'Lunges', 'Curls', 'Abs'];
    
    for(let i=0; i<count; i++) {
        const exerciseName = i < sampleExercises.length ? sampleExercises[i] : `Exercise ${i+1}`;
        rows.push([exerciseName, '3', '10']);
    }
    
    content = {
        headers: ['Exercise', 'Sets', 'Reps'],
        rows: rows,
        columnTypes: ['text', 'text', 'text']
    };
    w = 340;
    // Calculate approximate height: Header (40) + Rows (35 each) + Padding
    h = Math.min(100 + (count * 35), 600);
  } 
  // 2. Study / Books / Exams (Checklist or Table)
  else if (p.match(/(study|exam|book|read|class|learn|homework|research|assignment|lesson)/)) {
    category = 'study';
    title = '📚 Study List';
    
    if (p.includes('schedule') || p.includes('plan') || p.includes('timetable')) {
        // Study Schedule
        type = 'table';
        title = '📅 Study Schedule';
        const rows = [];
        for(let i=0; i<count; i++) {
             rows.push([`${9+i}:00 AM`, `Subject ${i+1}`, 'Topic']);
        }
        content = {
            headers: ['Time', 'Subject', 'Notes'],
            rows: rows,
            columnTypes: ['text', 'text', 'text']
        };
        w = 360;
        h = Math.min(100 + (count * 35), 600);
    } else {
        // Study Checklist
        type = 'checklist';
        const items = [];
        for(let i=0; i<count; i++) {
            items.push({ id: uuidv4(), text: `Chapter ${i+1} / Topic`, checked: false });
        }
        content = items;
        w = 280;
        h = Math.min(120 + (count * 30), 600);
    }
  } 
  // 3. Coding / Tech
  else if (p.match(/(code|js|typescript|python|html|css|function|api|dev|java|script)/)) {
    type = 'code';
    title = '💻 Code Snippet';
    category = 'code';
    // Generate some mock code lines
    const mockLines = Array(count).fill(null).map((_, i) => `  // Logic for step ${i+1}\n  const data${i} = await fetchData();`).join('\n');
    content = `// ${prompt}\nasync function execute() {\n${mockLines}\n  return true;\n}`;
    w = 340;
    h = Math.min(200 + (count * 15), 500);
  }
  // 4. Shopping / Groceries
  else if (p.match(/(shop|buy|grocery|market|store|food|ingredients)/)) {
      type = 'checklist';
      title = '🛒 Shopping List';
      const items = [];
      const commonItems = ['Milk', 'Eggs', 'Bread', 'Vegetables', 'Fruits', 'Coffee'];
      for(let i=0; i<count; i++) {
          items.push({ 
              id: uuidv4(), 
              text: i < commonItems.length ? commonItems[i] : `Item ${i+1}`, 
              checked: false 
          });
      }
      content = items;
      w = 260;
      h = Math.min(120 + (count * 30), 600);
  }
  // 5. Generic Tables / Schedules
  else if (p.match(/(table|grid|schedule|plan|chart|data)/)) {
      type = 'table';
      title = '📊 Data Table';
      const rows = [];
      for(let i=0; i<count; i++) {
          rows.push([`Row ${i+1}`, 'Value', 'Notes']);
      }
      content = {
          headers: ['Item', 'Status', 'Comments'],
          rows: rows,
          columnTypes: ['text', 'text', 'text']
      };
      w = 320;
      h = Math.min(100 + (count * 35), 600);
  }
  // 6. Generic To-Do
  else if (p.match(/(todo|list|task|remind)/)) {
      type = 'checklist';
      title = '✅ To-Do';
      const items = [];
      for(let i=0; i<count; i++) {
          items.push({ id: uuidv4(), text: `Task ${i+1}`, checked: false });
      }
      content = items;
      w = 260;
      h = Math.min(120 + (count * 30), 600);
  }
  // 7. Images
  else if (p.match(/(image|photo|picture|pic|draw)/)) {
      type = 'image';
      title = '🖼️ Image';
      // Basic heuristic to check if user provided a URL in the prompt
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const match = prompt.match(urlRegex);
      content = match ? match[0] : ''; 
      w = 300;
      h = 300;
  }
  else {
      // Default Text Note
      type = 'text';
      title = '📝 Note';
      content = prompt;
      h = 160;
  }

  return {
    id: uuidv4(),
    type,
    x: centerPos.x - (w / 2),
    y: centerPos.y - (h / 2),
    w,
    h,
    title,
    category,
    content
  };
};

export const improveText = async (currentText: string, instruction: string): Promise<string> => {
   // Mock improvement logic
   await new Promise(resolve => setTimeout(resolve, 400));
   
   if (instruction.includes('summarize')) {
       return currentText.split(' ').slice(0, 10).join(' ') + '... (Summary)';
   }
   if (instruction.includes('polish')) {
       return currentText + " ✨";
   }
   if (instruction.includes('expand')) {
       return currentText + " (Expanded content placeholder based on previous context)";
   }
   return currentText;
}