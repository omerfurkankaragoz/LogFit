const API_KEY = 'YOUR_RAPIDAPI_KEY'; // Gerçek kullanımda RapidAPI key gerekli
const BASE_URL = 'https://exercisedb.p.rapidapi.com';

// Demo data - 100+ hareket ile genişletildi
const DEMO_EXERCISES = [
  // GÖĞÜS HAREKETLERİ
  {
    id: '1',
    name: 'Barbell Bench Press',
    bodyPart: 'chest',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'pectorals',
    instructions: ['Lie on bench with feet flat on floor', 'Grip bar slightly wider than shoulders', 'Lower bar to chest', 'Press bar up explosively']
  },
  {
    id: '2',
    name: 'Dumbbell Bench Press',
    bodyPart: 'chest',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552244/pexels-photo-1552244.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'pectorals',
    instructions: ['Lie on bench holding dumbbells', 'Start with arms extended', 'Lower dumbbells to chest level', 'Press back to starting position']
  },
  {
    id: '3',
    name: 'Incline Barbell Press',
    bodyPart: 'chest',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552243/pexels-photo-1552243.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'upper pectorals',
    instructions: ['Set bench to 30-45 degree incline', 'Lie back and grip bar', 'Lower to upper chest', 'Press up and slightly back']
  },
  {
    id: '4',
    name: 'Incline Dumbbell Press',
    bodyPart: 'chest',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552245/pexels-photo-1552245.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'upper pectorals',
    instructions: ['Set bench to incline position', 'Hold dumbbells at chest level', 'Press dumbbells up and together', 'Lower with control']
  },
  {
    id: '5',
    name: 'Decline Bench Press',
    bodyPart: 'chest',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552246/pexels-photo-1552246.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'lower pectorals',
    instructions: ['Set bench to decline position', 'Secure feet in foot holds', 'Lower bar to lower chest', 'Press up explosively']
  },
  {
    id: '6',
    name: 'Dumbbell Flyes',
    bodyPart: 'chest',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552247/pexels-photo-1552247.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'pectorals',
    instructions: ['Lie on bench with dumbbells extended', 'Lower weights in wide arc', 'Feel stretch in chest', 'Bring dumbbells together above chest']
  },
  {
    id: '7',
    name: 'Push-ups',
    bodyPart: 'chest',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552248/pexels-photo-1552248.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'pectorals',
    instructions: ['Start in plank position', 'Lower body until chest nearly touches floor', 'Push back up to starting position', 'Keep body straight throughout']
  },
  {
    id: '8',
    name: 'Chest Dips',
    bodyPart: 'chest',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'lower pectorals',
    instructions: ['Grip parallel bars', 'Lean forward slightly', 'Lower body until stretch in chest', 'Push back up to starting position']
  },
  {
    id: '9',
    name: 'Cable Crossover',
    bodyPart: 'chest',
    equipment: 'cable',
    gifUrl: 'https://images.pexels.com/photos/1552250/pexels-photo-1552250.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'pectorals',
    instructions: ['Stand between cable machines', 'Grab high pulleys', 'Bring hands together in front of chest', 'Return with control']
  },
  {
    id: '10',
    name: 'Pec Deck Machine',
    bodyPart: 'chest',
    equipment: 'machine',
    gifUrl: 'https://images.pexels.com/photos/1552251/pexels-photo-1552251.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'pectorals',
    instructions: ['Sit with back against pad', 'Grip handles or place arms on pads', 'Bring arms together in front of chest', 'Return slowly to starting position']
  },

  // SIRT HAREKETLERİ
  {
    id: '11',
    name: 'Deadlift',
    bodyPart: 'back',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'erector spinae',
    instructions: ['Stand with feet hip-width apart', 'Grip bar with hands outside legs', 'Keep back straight, lift with legs', 'Stand up straight, then lower with control']
  },
  {
    id: '12',
    name: 'Barbell Row',
    bodyPart: 'back',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552253/pexels-photo-1552253.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'latissimus dorsi',
    instructions: ['Bend over holding barbell', 'Keep back straight', 'Pull bar to lower chest', 'Lower with control']
  },
  {
    id: '13',
    name: 'Pull-ups',
    bodyPart: 'back',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552254/pexels-photo-1552254.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'latissimus dorsi',
    instructions: ['Hang from pull-up bar', 'Pull body up until chin over bar', 'Lower body with control', 'Repeat for desired reps']
  },
  {
    id: '14',
    name: 'Lat Pulldown',
    bodyPart: 'back',
    equipment: 'cable',
    gifUrl: 'https://images.pexels.com/photos/1552255/pexels-photo-1552255.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'latissimus dorsi',
    instructions: ['Sit at lat pulldown machine', 'Grip bar wider than shoulders', 'Pull bar down to upper chest', 'Return slowly to starting position']
  },
  {
    id: '15',
    name: 'Dumbbell Row',
    bodyPart: 'back',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552256/pexels-photo-1552256.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'latissimus dorsi',
    instructions: ['Place one knee on bench', 'Hold dumbbell in opposite hand', 'Pull dumbbell to hip', 'Lower with control']
  },
  {
    id: '16',
    name: 'T-Bar Row',
    bodyPart: 'back',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552257/pexels-photo-1552257.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'middle trapezius',
    instructions: ['Straddle T-bar', 'Bend over and grip handles', 'Pull bar to chest', 'Lower with control']
  },
  {
    id: '17',
    name: 'Cable Row',
    bodyPart: 'back',
    equipment: 'cable',
    gifUrl: 'https://images.pexels.com/photos/1552258/pexels-photo-1552258.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'latissimus dorsi',
    instructions: ['Sit at cable row machine', 'Grip handle with both hands', 'Pull handle to abdomen', 'Return slowly to starting position']
  },
  {
    id: '18',
    name: 'Face Pulls',
    bodyPart: 'back',
    equipment: 'cable',
    gifUrl: 'https://images.pexels.com/photos/1552259/pexels-photo-1552259.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'rear deltoids',
    instructions: ['Set cable at face height', 'Grip rope with both hands', 'Pull rope to face', 'Return with control']
  },
  {
    id: '19',
    name: 'Shrugs',
    bodyPart: 'back',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552260/pexels-photo-1552260.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'upper trapezius',
    instructions: ['Hold dumbbells at sides', 'Shrug shoulders up toward ears', 'Hold briefly', 'Lower shoulders slowly']
  },
  {
    id: '20',
    name: 'Hyperextensions',
    bodyPart: 'back',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552261/pexels-photo-1552261.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'erector spinae',
    instructions: ['Lie face down on hyperextension bench', 'Cross arms over chest', 'Lower upper body', 'Raise back to starting position']
  },

  // BACAK HAREKETLERİ
  {
    id: '21',
    name: 'Barbell Squat',
    bodyPart: 'legs',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552262/pexels-photo-1552262.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'quadriceps',
    instructions: ['Position bar on upper back', 'Stand with feet shoulder-width apart', 'Lower body until thighs parallel to floor', 'Drive through heels to stand']
  },
  {
    id: '22',
    name: 'Leg Press',
    bodyPart: 'legs',
    equipment: 'machine',
    gifUrl: 'https://images.pexels.com/photos/1552263/pexels-photo-1552263.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'quadriceps',
    instructions: ['Sit in leg press machine', 'Place feet on platform', 'Lower weight until knees at 90 degrees', 'Press weight back up']
  },
  {
    id: '23',
    name: 'Romanian Deadlift',
    bodyPart: 'legs',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552264/pexels-photo-1552264.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'hamstrings',
    instructions: ['Hold barbell with overhand grip', 'Keep legs slightly bent', 'Lower bar by pushing hips back', 'Return to starting position']
  },
  {
    id: '24',
    name: 'Leg Curl',
    bodyPart: 'legs',
    equipment: 'machine',
    gifUrl: 'https://images.pexels.com/photos/1552265/pexels-photo-1552265.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'hamstrings',
    instructions: ['Lie face down on leg curl machine', 'Position ankles under pad', 'Curl heels toward glutes', 'Lower slowly to starting position']
  },
  {
    id: '25',
    name: 'Leg Extension',
    bodyPart: 'legs',
    equipment: 'machine',
    gifUrl: 'https://images.pexels.com/photos/1552266/pexels-photo-1552266.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'quadriceps',
    instructions: ['Sit on leg extension machine', 'Position ankles under pad', 'Extend legs until straight', 'Lower slowly to starting position']
  },
  {
    id: '26',
    name: 'Lunges',
    bodyPart: 'legs',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552267/pexels-photo-1552267.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'quadriceps',
    instructions: ['Step forward with one leg', 'Lower hips until both knees at 90 degrees', 'Push back to starting position', 'Repeat with other leg']
  },
  {
    id: '27',
    name: 'Calf Raises',
    bodyPart: 'legs',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552268/pexels-photo-1552268.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'calves',
    instructions: ['Stand on balls of feet', 'Raise heels as high as possible', 'Hold briefly', 'Lower heels slowly']
  },
  {
    id: '28',
    name: 'Bulgarian Split Squat',
    bodyPart: 'legs',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552269/pexels-photo-1552269.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'quadriceps',
    instructions: ['Place rear foot on bench', 'Lower into lunge position', 'Push through front heel to return', 'Complete set then switch legs']
  },
  {
    id: '29',
    name: 'Goblet Squat',
    bodyPart: 'legs',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552270/pexels-photo-1552270.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'quadriceps',
    instructions: ['Hold dumbbell at chest level', 'Stand with feet shoulder-width apart', 'Squat down keeping chest up', 'Drive through heels to stand']
  },
  {
    id: '30',
    name: 'Stiff Leg Deadlift',
    bodyPart: 'legs',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552271/pexels-photo-1552271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'hamstrings',
    instructions: ['Hold dumbbells in front of thighs', 'Keep legs straight', 'Lower weights toward floor', 'Return to starting position']
  },

  // OMUZ HAREKETLERİ
  {
    id: '31',
    name: 'Overhead Press',
    bodyPart: 'shoulders',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552272/pexels-photo-1552272.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'deltoids',
    instructions: ['Hold bar at shoulder height', 'Press bar straight overhead', 'Lower bar to starting position', 'Keep core tight throughout']
  },
  {
    id: '32',
    name: 'Dumbbell Shoulder Press',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552273/pexels-photo-1552273.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'deltoids',
    instructions: ['Hold dumbbells at shoulder height', 'Press weights overhead', 'Lower with control', 'Keep core engaged']
  },
  {
    id: '33',
    name: 'Lateral Raises',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552274/pexels-photo-1552274.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'lateral deltoids',
    instructions: ['Hold dumbbells at sides', 'Raise arms out to sides', 'Lift to shoulder height', 'Lower slowly to starting position']
  },
  {
    id: '34',
    name: 'Front Raises',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552275/pexels-photo-1552275.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'anterior deltoids',
    instructions: ['Hold dumbbells in front of thighs', 'Raise one arm forward', 'Lift to shoulder height', 'Lower and repeat with other arm']
  },
  {
    id: '35',
    name: 'Rear Delt Flyes',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552276/pexels-photo-1552276.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'posterior deltoids',
    instructions: ['Bend over holding dumbbells', 'Raise arms out to sides', 'Squeeze shoulder blades together', 'Lower with control']
  },
  {
    id: '36',
    name: 'Arnold Press',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552277/pexels-photo-1552277.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'deltoids',
    instructions: ['Start with palms facing you', 'Rotate and press overhead', 'Reverse the motion', 'Return to starting position']
  },
  {
    id: '37',
    name: 'Upright Rows',
    bodyPart: 'shoulders',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552278/pexels-photo-1552278.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'deltoids',
    instructions: ['Hold bar with narrow grip', 'Pull bar up to chest level', 'Keep elbows higher than hands', 'Lower with control']
  },
  {
    id: '38',
    name: 'Pike Push-ups',
    bodyPart: 'shoulders',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552279/pexels-photo-1552279.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'deltoids',
    instructions: ['Start in downward dog position', 'Lower head toward floor', 'Push back to starting position', 'Keep legs straight']
  },
  {
    id: '39',
    name: 'Cable Lateral Raise',
    bodyPart: 'shoulders',
    equipment: 'cable',
    gifUrl: 'https://images.pexels.com/photos/1552280/pexels-photo-1552280.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'lateral deltoids',
    instructions: ['Stand beside cable machine', 'Grab handle with far hand', 'Raise arm out to side', 'Lower with control']
  },
  {
    id: '40',
    name: 'Handstand Push-ups',
    bodyPart: 'shoulders',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552281/pexels-photo-1552281.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'deltoids',
    instructions: ['Get into handstand position against wall', 'Lower head toward floor', 'Push back to starting position', 'Advanced exercise']
  },

  // KOL HAREKETLERİ
  {
    id: '41',
    name: 'Barbell Curl',
    bodyPart: 'arms',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552282/pexels-photo-1552282.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'biceps',
    instructions: ['Hold barbell with underhand grip', 'Keep elbows at sides', 'Curl bar up to chest', 'Lower with control']
  },
  {
    id: '42',
    name: 'Dumbbell Curl',
    bodyPart: 'arms',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552283/pexels-photo-1552283.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'biceps',
    instructions: ['Hold dumbbells at sides', 'Curl one arm at a time', 'Squeeze bicep at top', 'Lower slowly']
  },
  {
    id: '43',
    name: 'Hammer Curls',
    bodyPart: 'arms',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552284/pexels-photo-1552284.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'biceps',
    instructions: ['Hold dumbbells with neutral grip', 'Keep thumbs up throughout', 'Curl weights to shoulders', 'Lower with control']
  },
  {
    id: '44',
    name: 'Tricep Dips',
    bodyPart: 'arms',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552285/pexels-photo-1552285.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'triceps',
    instructions: ['Support body on parallel bars', 'Lower body by bending elbows', 'Push back to starting position', 'Keep body upright']
  },
  {
    id: '45',
    name: 'Close Grip Bench Press',
    bodyPart: 'arms',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552286/pexels-photo-1552286.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'triceps',
    instructions: ['Lie on bench with narrow grip', 'Lower bar to chest', 'Press up focusing on triceps', 'Keep elbows close to body']
  },
  {
    id: '46',
    name: 'Overhead Tricep Extension',
    bodyPart: 'arms',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552287/pexels-photo-1552287.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'triceps',
    instructions: ['Hold dumbbell overhead with both hands', 'Lower weight behind head', 'Extend arms back to starting position', 'Keep elbows stationary']
  },
  {
    id: '47',
    name: 'Cable Tricep Pushdown',
    bodyPart: 'arms',
    equipment: 'cable',
    gifUrl: 'https://images.pexels.com/photos/1552288/pexels-photo-1552288.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'triceps',
    instructions: ['Stand at cable machine', 'Grip rope or bar', 'Push down until arms straight', 'Return with control']
  },
  {
    id: '48',
    name: 'Preacher Curls',
    bodyPart: 'arms',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552289/pexels-photo-1552289.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'biceps',
    instructions: ['Sit at preacher bench', 'Rest arms on angled pad', 'Curl weight up', 'Lower slowly to starting position']
  },
  {
    id: '49',
    name: 'Cable Bicep Curl',
    bodyPart: 'arms',
    equipment: 'cable',
    gifUrl: 'https://images.pexels.com/photos/1552290/pexels-photo-1552290.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'biceps',
    instructions: ['Stand at cable machine', 'Grip handle with underhand grip', 'Curl handle to chest', 'Lower with control']
  },
  {
    id: '50',
    name: 'Diamond Push-ups',
    bodyPart: 'arms',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552291/pexels-photo-1552291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'triceps',
    instructions: ['Form diamond with hands', 'Lower body to hands', 'Push back to starting position', 'Focus on tricep engagement']
  },

  // KARIN HAREKETLERİ
  {
    id: '51',
    name: 'Plank',
    bodyPart: 'core',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552292/pexels-photo-1552292.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'abs',
    instructions: ['Get in push-up position', 'Rest on forearms', 'Keep body straight', 'Hold position for time']
  },
  {
    id: '52',
    name: 'Crunches',
    bodyPart: 'core',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552293/pexels-photo-1552293.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'abs',
    instructions: ['Lie on back with knees bent', 'Place hands behind head', 'Lift shoulders off ground', 'Lower with control']
  },
  {
    id: '53',
    name: 'Russian Twists',
    bodyPart: 'core',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552294/pexels-photo-1552294.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'obliques',
    instructions: ['Sit with knees bent', 'Lean back slightly', 'Rotate torso side to side', 'Keep feet off ground']
  },
  {
    id: '54',
    name: 'Leg Raises',
    bodyPart: 'core',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552295/pexels-photo-1552295.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'lower abs',
    instructions: ['Lie on back with legs straight', 'Raise legs to 90 degrees', 'Lower slowly without touching floor', 'Keep lower back pressed down']
  },
  {
    id: '55',
    name: 'Mountain Climbers',
    bodyPart: 'core',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552296/pexels-photo-1552296.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'abs',
    instructions: ['Start in plank position', 'Bring one knee to chest', 'Switch legs quickly', 'Keep hips level']
  },
  {
    id: '56',
    name: 'Dead Bug',
    bodyPart: 'core',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552297/pexels-photo-1552297.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'abs',
    instructions: ['Lie on back with arms up', 'Bring knees to 90 degrees', 'Extend opposite arm and leg', 'Return and switch sides']
  },
  {
    id: '57',
    name: 'Bicycle Crunches',
    bodyPart: 'core',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552298/pexels-photo-1552298.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'obliques',
    instructions: ['Lie on back with hands behind head', 'Bring knee to opposite elbow', 'Switch sides in cycling motion', 'Keep shoulders off ground']
  },
  {
    id: '58',
    name: 'Hanging Leg Raises',
    bodyPart: 'core',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552299/pexels-photo-1552299.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'lower abs',
    instructions: ['Hang from pull-up bar', 'Raise knees to chest', 'Lower legs with control', 'Avoid swinging']
  },
  {
    id: '59',
    name: 'Side Plank',
    bodyPart: 'core',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552300/pexels-photo-1552300.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'obliques',
    instructions: ['Lie on side resting on forearm', 'Lift hips off ground', 'Keep body straight', 'Hold position then switch sides']
  },
  {
    id: '60',
    name: 'Ab Wheel Rollout',
    bodyPart: 'core',
    equipment: 'ab wheel',
    gifUrl: 'https://images.pexels.com/photos/1552301/pexels-photo-1552301.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'abs',
    instructions: ['Kneel holding ab wheel', 'Roll forward extending body', 'Roll back to starting position', 'Keep core tight throughout']
  },

  // EK GÖĞÜS HAREKETLERİ
  {
    id: '61',
    name: 'Incline Dumbbell Flyes',
    bodyPart: 'chest',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552302/pexels-photo-1552302.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'upper pectorals',
    instructions: ['Set bench to incline', 'Hold dumbbells with arms extended', 'Lower in wide arc', 'Bring dumbbells together above chest']
  },
  {
    id: '62',
    name: 'Cable Chest Press',
    bodyPart: 'chest',
    equipment: 'cable',
    gifUrl: 'https://images.pexels.com/photos/1552303/pexels-photo-1552303.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'pectorals',
    instructions: ['Stand between cable machines', 'Grab handles at chest height', 'Press forward bringing hands together', 'Return with control']
  },
  {
    id: '63',
    name: 'Decline Dumbbell Press',
    bodyPart: 'chest',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552304/pexels-photo-1552304.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'lower pectorals',
    instructions: ['Set bench to decline position', 'Hold dumbbells at chest level', 'Press dumbbells up', 'Lower with control']
  },
  {
    id: '64',
    name: 'Chest Press Machine',
    bodyPart: 'chest',
    equipment: 'machine',
    gifUrl: 'https://images.pexels.com/photos/1552305/pexels-photo-1552305.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'pectorals',
    instructions: ['Sit with back against pad', 'Grip handles at chest level', 'Press handles forward', 'Return slowly to starting position']
  },
  {
    id: '65',
    name: 'Svend Press',
    bodyPart: 'chest',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552306/pexels-photo-1552306.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'inner pectorals',
    instructions: ['Hold weight plates together at chest', 'Press plates away from body', 'Squeeze plates together throughout', 'Return to chest']
  },

  // EK SIRT HAREKETLERİ
  {
    id: '66',
    name: 'Wide Grip Pull-ups',
    bodyPart: 'back',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552307/pexels-photo-1552307.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'latissimus dorsi',
    instructions: ['Hang from bar with wide grip', 'Pull body up until chin over bar', 'Focus on lat engagement', 'Lower with control']
  },
  {
    id: '67',
    name: 'Chin-ups',
    bodyPart: 'back',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552308/pexels-photo-1552308.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'latissimus dorsi',
    instructions: ['Hang from bar with underhand grip', 'Pull body up until chin over bar', 'Lower body with control', 'Engage biceps and lats']
  },
  {
    id: '68',
    name: 'Reverse Flyes',
    bodyPart: 'back',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552309/pexels-photo-1552309.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'rear deltoids',
    instructions: ['Bend over holding dumbbells', 'Raise arms out to sides', 'Squeeze shoulder blades', 'Lower with control']
  },
  {
    id: '69',
    name: 'Inverted Rows',
    bodyPart: 'back',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552310/pexels-photo-1552310.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'latissimus dorsi',
    instructions: ['Lie under bar or suspension trainer', 'Pull body up to bar', 'Keep body straight', 'Lower with control']
  },
  {
    id: '70',
    name: 'Good Mornings',
    bodyPart: 'back',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552311/pexels-photo-1552311.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'erector spinae',
    instructions: ['Place bar on upper back', 'Hinge at hips keeping back straight', 'Lower until torso parallel to floor', 'Return to starting position']
  },

  // EK BACAK HAREKETLERİ
  {
    id: '71',
    name: 'Front Squat',
    bodyPart: 'legs',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552312/pexels-photo-1552312.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'quadriceps',
    instructions: ['Hold bar across front of shoulders', 'Keep elbows high', 'Squat down keeping chest up', 'Drive through heels to stand']
  },
  {
    id: '72',
    name: 'Sumo Deadlift',
    bodyPart: 'legs',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552313/pexels-photo-1552313.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'glutes',
    instructions: ['Stand with wide stance', 'Grip bar with hands inside legs', 'Keep back straight', 'Drive through heels to stand']
  },
  {
    id: '73',
    name: 'Walking Lunges',
    bodyPart: 'legs',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552314/pexels-photo-1552314.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'quadriceps',
    instructions: ['Step forward into lunge', 'Push off back foot', 'Step forward with back leg', 'Continue walking pattern']
  },
  {
    id: '74',
    name: 'Hip Thrusts',
    bodyPart: 'legs',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552315/pexels-photo-1552315.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'glutes',
    instructions: ['Sit with back against bench', 'Place bar across hips', 'Drive hips up squeezing glutes', 'Lower with control']
  },
  {
    id: '75',
    name: 'Step-ups',
    bodyPart: 'legs',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552316/pexels-photo-1552316.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'quadriceps',
    instructions: ['Step up onto box or bench', 'Drive through heel', 'Step down with control', 'Alternate legs or complete set']
  },

  // EK OMUZ HAREKETLERİ
  {
    id: '76',
    name: 'Seated Dumbbell Press',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552317/pexels-photo-1552317.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'deltoids',
    instructions: ['Sit with back support', 'Hold dumbbells at shoulder height', 'Press weights overhead', 'Lower with control']
  },
  {
    id: '77',
    name: 'Cable Rear Delt Flyes',
    bodyPart: 'shoulders',
    equipment: 'cable',
    gifUrl: 'https://images.pexels.com/photos/1552318/pexels-photo-1552318.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'posterior deltoids',
    instructions: ['Set cables at chest height', 'Cross cables and pull apart', 'Squeeze shoulder blades', 'Return with control']
  },
  {
    id: '78',
    name: 'Dumbbell Shrugs',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552319/pexels-photo-1552319.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'upper trapezius',
    instructions: ['Hold dumbbells at sides', 'Shrug shoulders up', 'Hold briefly at top', 'Lower slowly']
  },
  {
    id: '79',
    name: 'Machine Shoulder Press',
    bodyPart: 'shoulders',
    equipment: 'machine',
    gifUrl: 'https://images.pexels.com/photos/1552320/pexels-photo-1552320.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'deltoids',
    instructions: ['Sit with back against pad', 'Grip handles at shoulder height', 'Press handles overhead', 'Lower with control']
  },
  {
    id: '80',
    name: 'Band Pull-Aparts',
    bodyPart: 'shoulders',
    equipment: 'resistance band',
    gifUrl: 'https://images.pexels.com/photos/1552321/pexels-photo-1552321.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'posterior deltoids',
    instructions: ['Hold band at chest level', 'Pull band apart stretching across chest', 'Squeeze shoulder blades', 'Return with control']
  },

  // EK KOL HAREKETLERİ
  {
    id: '81',
    name: 'Concentration Curls',
    bodyPart: 'arms',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552322/pexels-photo-1552322.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'biceps',
    instructions: ['Sit with elbow against inner thigh', 'Curl dumbbell up', 'Squeeze bicep at top', 'Lower slowly']
  },
  {
    id: '82',
    name: 'Skull Crushers',
    bodyPart: 'arms',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552323/pexels-photo-1552323.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'triceps',
    instructions: ['Lie on bench holding bar', 'Lower bar to forehead', 'Extend arms back up', 'Keep elbows stationary']
  },
  {
    id: '83',
    name: 'Cable Hammer Curls',
    bodyPart: 'arms',
    equipment: 'cable',
    gifUrl: 'https://images.pexels.com/photos/1552324/pexels-photo-1552324.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'biceps',
    instructions: ['Stand at cable machine', 'Use rope attachment', 'Curl with neutral grip', 'Lower with control']
  },
  {
    id: '84',
    name: 'Tricep Kickbacks',
    bodyPart: 'arms',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552325/pexels-photo-1552325.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'triceps',
    instructions: ['Bend over holding dumbbell', 'Keep upper arm parallel to floor', 'Extend forearm back', 'Return with control']
  },
  {
    id: '85',
    name: '21s Bicep Curls',
    bodyPart: 'arms',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552326/pexels-photo-1552326.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'biceps',
    instructions: ['7 reps bottom half', '7 reps top half', '7 reps full range', 'No rest between phases']
  },

  // EK KARIN HAREKETLERİ
  {
    id: '86',
    name: 'V-ups',
    bodyPart: 'core',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552327/pexels-photo-1552327.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'abs',
    instructions: ['Lie on back with arms overhead', 'Simultaneously raise legs and torso', 'Touch hands to feet', 'Lower with control']
  },
  {
    id: '87',
    name: 'Hollow Body Hold',
    bodyPart: 'core',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552328/pexels-photo-1552328.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'abs',
    instructions: ['Lie on back with arms overhead', 'Lift shoulders and legs off ground', 'Create hollow shape', 'Hold position']
  },
  {
    id: '88',
    name: 'Cable Crunches',
    bodyPart: 'core',
    equipment: 'cable',
    gifUrl: 'https://images.pexels.com/photos/1552329/pexels-photo-1552329.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'abs',
    instructions: ['Kneel at cable machine', 'Hold rope at sides of head', 'Crunch down bringing elbows to knees', 'Return with control']
  },
  {
    id: '89',
    name: 'Wood Chops',
    bodyPart: 'core',
    equipment: 'cable',
    gifUrl: 'https://images.pexels.com/photos/1552330/pexels-photo-1552330.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'obliques',
    instructions: ['Stand sideways to cable', 'Pull cable across body', 'Rotate through core', 'Return with control']
  },
  {
    id: '90',
    name: 'Reverse Crunches',
    bodyPart: 'core',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552331/pexels-photo-1552331.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'lower abs',
    instructions: ['Lie on back with knees bent', 'Bring knees to chest', 'Lift hips off ground', 'Lower with control']
  },

  // COMPOUND HAREKETLERİ
  {
    id: '91',
    name: 'Clean and Press',
    bodyPart: 'shoulders',
    equipment: 'barbell',
    gifUrl: 'https://images.pexels.com/photos/1552332/pexels-photo-1552332.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'full body',
    instructions: ['Deadlift bar to chest', 'Clean bar to shoulders', 'Press overhead', 'Lower with control']
  },
  {
    id: '92',
    name: 'Thrusters',
    bodyPart: 'legs',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552333/pexels-photo-1552333.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'full body',
    instructions: ['Hold dumbbells at shoulders', 'Squat down', 'Drive up and press overhead', 'Lower and repeat']
  },
  {
    id: '93',
    name: 'Burpees',
    bodyPart: 'core',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552334/pexels-photo-1552334.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'full body',
    instructions: ['Start standing', 'Drop to push-up position', 'Do push-up', 'Jump feet to hands', 'Jump up with arms overhead']
  },
  {
    id: '94',
    name: 'Turkish Get-ups',
    bodyPart: 'core',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552335/pexels-photo-1552335.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'full body',
    instructions: ['Lie with weight overhead', 'Roll to elbow then hand', 'Bridge up to kneeling', 'Stand up', 'Reverse to return']
  },
  {
    id: '95',
    name: 'Man Makers',
    bodyPart: 'core',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552336/pexels-photo-1552336.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'full body',
    instructions: ['Start with dumbbells', 'Burpee with push-up', 'Row each arm', 'Jump up and press overhead']
  },

  // FUNCTIONAL HAREKETLERİ
  {
    id: '96',
    name: 'Farmer\'s Walk',
    bodyPart: 'back',
    equipment: 'dumbbell',
    gifUrl: 'https://images.pexels.com/photos/1552337/pexels-photo-1552337.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'full body',
    instructions: ['Hold heavy weights at sides', 'Walk forward with good posture', 'Keep core tight', 'Walk for distance or time']
  },
  {
    id: '97',
    name: 'Bear Crawl',
    bodyPart: 'core',
    equipment: 'body weight',
    gifUrl: 'https://images.pexels.com/photos/1552338/pexels-photo-1552338.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'full body',
    instructions: ['Start on hands and knees', 'Lift knees slightly', 'Crawl forward moving opposite limbs', 'Keep hips level']
  },
  {
    id: '98',
    name: 'Sled Push',
    bodyPart: 'legs',
    equipment: 'sled',
    gifUrl: 'https://images.pexels.com/photos/1552339/pexels-photo-1552339.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'full body',
    instructions: ['Grip sled handles', 'Lean forward at 45 degrees', 'Drive through legs', 'Push sled forward']
  },
  {
    id: '99',
    name: 'Battle Ropes',
    bodyPart: 'core',
    equipment: 'rope',
    gifUrl: 'https://images.pexels.com/photos/1552340/pexels-photo-1552340.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'full body',
    instructions: ['Hold rope ends', 'Create waves alternating arms', 'Keep core engaged', 'Maintain rhythm']
  },
  {
    id: '100',
    name: 'Box Jumps',
    bodyPart: 'legs',
    equipment: 'box',
    gifUrl: 'https://images.pexels.com/photos/1552341/pexels-photo-1552341.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    target: 'quadriceps',
    instructions: ['Stand in front of box', 'Jump up onto box', 'Land softly', 'Step down and repeat']
  }
];

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  target: string;
  instructions: string[];
}

export const getExercises = async (): Promise<Exercise[]> => {
  // Gerçek API kullanımı için:
  // const response = await fetch(`${BASE_URL}/exercises`, {
  //   headers: {
  //     'X-RapidAPI-Key': API_KEY,
  //     'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
  //   }
  // });
  // return response.json();
  
  // Demo data döndür
  return new Promise((resolve) => {
    setTimeout(() => resolve(DEMO_EXERCISES), 500);
  });
};

export const getExercisesByBodyPart = async (bodyPart: string): Promise<Exercise[]> => {
  const exercises = await getExercises();
  return exercises.filter(ex => ex.bodyPart === bodyPart);
};

export const searchExercises = async (query: string): Promise<Exercise[]> => {
  const exercises = await getExercises();
  return exercises.filter(ex => 
    ex.name.toLowerCase().includes(query.toLowerCase()) ||
    ex.target.toLowerCase().includes(query.toLowerCase())
  );
};

export const getBodyParts = (): string[] => {
  return ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
};