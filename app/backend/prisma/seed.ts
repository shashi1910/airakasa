import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// TheMealDB API - free, no API key required
const MEALDB_API = 'https://www.themealdb.com/api/json/v1/1';

interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strIngredient1?: string;
  strMeasure1?: string;
}

interface MealDBResponse {
  meals: MealDBMeal[] | null;
}

interface MealDBCategory {
  strCategory: string;
}

// Fetch all available categories from TheMealDB
async function fetchAllCategories(): Promise<string[]> {
  try {
    const response = await fetch(`${MEALDB_API}/list.php?c=list`);
    const data = await response.json();
    if (data.meals && Array.isArray(data.meals)) {
      return data.meals.map((cat: MealDBCategory) => cat.strCategory);
    }
  } catch (err) {
    console.log('Failed to fetch categories, using defaults');
  }
  return ['Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Side', 'Starter', 'Vegetarian', 'Vegan', 'Breakfast', 'Goat'];
}

// Fetch meals from a specific category
async function fetchMealsByCategory(category: string, limit: number = 15): Promise<MealDBMeal[]> {
  const meals: MealDBMeal[] = [];
  try {
    const response = await fetch(`${MEALDB_API}/filter.php?c=${encodeURIComponent(category)}`);
    const data: MealDBResponse = await response.json();
    
    if (data.meals && data.meals.length > 0) {
      const mealsToFetch = data.meals.slice(0, limit);
      console.log(`  Fetching ${mealsToFetch.length} meals from ${category}...`);
      
      for (const meal of mealsToFetch) {
        try {
          const detailResponse = await fetch(`${MEALDB_API}/lookup.php?i=${meal.idMeal}`);
          const detailData: MealDBResponse = await detailResponse.json();
          if (detailData.meals && detailData.meals[0]) {
            meals.push(detailData.meals[0]);
          }
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          console.log(`    Failed to fetch details for ${meal.idMeal}`);
        }
      }
    }
  } catch (err) {
    console.log(`  Failed to fetch category ${category}`);
  }
  return meals;
}

// Fetch random meals
async function fetchRandomMeals(count: number = 20): Promise<MealDBMeal[]> {
  const meals: MealDBMeal[] = [];
  const mealIds = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    try {
      const response = await fetch(`${MEALDB_API}/random.php`);
      const data: MealDBResponse = await response.json();
      if (data.meals && data.meals[0] && !mealIds.has(data.meals[0].idMeal)) {
        mealIds.add(data.meals[0].idMeal);
        meals.push(data.meals[0]);
      }
      await new Promise(resolve => setTimeout(resolve, 150));
    } catch (err) {
      console.log(`  Failed to fetch random meal ${i + 1}`);
    }
  }
  
  return meals;
}

// Search for popular meals
async function searchPopularMeals(): Promise<MealDBMeal[]> {
  const popularSearches = [
    'Arrabiata', 'Chicken', 'Beef', 'Pasta', 'Pizza', 'Burger', 'Salad', 
    'Soup', 'Rice', 'Fish', 'Cake', 'Bread', 'Egg', 'Pork', 'Lamb'
  ];
  const meals: MealDBMeal[] = [];
  const mealIds = new Set<string>();
  
  for (const search of popularSearches) {
    try {
      const response = await fetch(`${MEALDB_API}/search.php?s=${encodeURIComponent(search)}`);
      const data: MealDBResponse = await response.json();
      if (data.meals && Array.isArray(data.meals)) {
        for (const meal of data.meals.slice(0, 3)) {
          if (!mealIds.has(meal.idMeal)) {
            mealIds.add(meal.idMeal);
            meals.push(meal);
          }
        }
      }
      await new Promise(resolve => setTimeout(resolve, 150));
    } catch (err) {
      console.log(`  Failed to search for ${search}`);
    }
  }
  
  return meals;
}

async function fetchAllMealsFromAPI(): Promise<MealDBMeal[]> {
  const allMeals: MealDBMeal[] = [];
  const mealIds = new Set<string>();
  
  console.log('Fetching meals from TheMealDB API...');
  
  // Method 1: Fetch from multiple categories
  console.log('Method 1: Fetching by categories...');
  const categories = await fetchAllCategories();
  const categoriesToUse = categories.slice(0, 10); // Use first 10 categories
  
  for (const category of categoriesToUse) {
    const meals = await fetchMealsByCategory(category, 10);
    for (const meal of meals) {
      if (!mealIds.has(meal.idMeal)) {
        mealIds.add(meal.idMeal);
        allMeals.push(meal);
      }
    }
  }
  
  console.log(`  Fetched ${allMeals.length} meals from categories`);
  
  // Method 2: Search for popular meals
  console.log('Method 2: Searching popular meals...');
  const popularMeals = await searchPopularMeals();
  for (const meal of popularMeals) {
    if (!mealIds.has(meal.idMeal)) {
      mealIds.add(meal.idMeal);
      allMeals.push(meal);
    }
  }
  
  console.log(`  Total after popular search: ${allMeals.length} meals`);
  
  // Method 3: Fetch random meals to fill up
  if (allMeals.length < 50) {
    console.log('Method 3: Fetching random meals to reach 50+ items...');
    const randomMeals = await fetchRandomMeals(30);
    for (const meal of randomMeals) {
      if (!mealIds.has(meal.idMeal)) {
        mealIds.add(meal.idMeal);
        allMeals.push(meal);
      }
    }
  }
  
  console.log(`Total unique meals fetched: ${allMeals.length}`);
  return allMeals;
}

function mapCategoryToOurCategory(mealCategory: string): string {
  const categoryMap: Record<string, string> = {
    'Seafood': 'Non-veg',
    'Chicken': 'Non-veg',
    'Beef': 'Non-veg',
    'Lamb': 'Non-veg',
    'Pork': 'Non-veg',
    'Goat': 'Non-veg',
    'Vegetarian': 'Vegetable',
    'Vegan': 'Vegetable',
    'Side': 'Vegetable',
    'Dessert': 'Breads',
    'Breakfast': 'Breads',
    'Starter': 'Vegetable',
    'Pasta': 'Vegetable',
  };
  return categoryMap[mealCategory] || 'Vegetable';
}

async function main() {
  console.log('Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Fruit' },
      update: {},
      create: { name: 'Fruit' },
    }),
    prisma.category.upsert({
      where: { name: 'Vegetable' },
      update: {},
      create: { name: 'Vegetable' },
    }),
    prisma.category.upsert({
      where: { name: 'Non-veg' },
      update: {},
      create: { name: 'Non-veg' },
    }),
    prisma.category.upsert({
      where: { name: 'Breads' },
      update: {},
      create: { name: 'Breads' },
    }),
  ]);

  const fruitCategory = categories[0];
  const vegetableCategory = categories[1];
  const nonVegCategory = categories[2];
  const breadsCategory = categories[3];

  // Fetch meals from TheMealDB API
  const apiMeals = await fetchAllMealsFromAPI();
  
  console.log(`\nProcessing ${apiMeals.length} meals...`);

  // Add some fruit items as fallback
  const fallbackItems = [
    { name: 'Apple', description: 'Fresh red apples', priceInPaise: 8000, stock: 50, categoryId: fruitCategory.id, imageUrl: 'https://via.placeholder.com/200?text=Apple' },
    { name: 'Banana', description: 'Ripe yellow bananas', priceInPaise: 4000, stock: 100, categoryId: fruitCategory.id, imageUrl: 'https://via.placeholder.com/200?text=Banana' },
    { name: 'Orange', description: 'Sweet oranges', priceInPaise: 6000, stock: 75, categoryId: fruitCategory.id, imageUrl: 'https://via.placeholder.com/200?text=Orange' },
    { name: 'Mango', description: 'Seasonal mangoes', priceInPaise: 12000, stock: 30, categoryId: fruitCategory.id, imageUrl: 'https://via.placeholder.com/200?text=Mango' },
  ];

  // Process API meals
  let createdCount = 0;
  let skippedCount = 0;
  
  for (const meal of apiMeals) {
    const categoryName = mapCategoryToOurCategory(meal.strCategory);
    const category = categories.find(c => c.name === categoryName) || vegetableCategory;
    
    // Extract first 150 chars of instructions as description
    const description = meal.strInstructions 
      ? meal.strInstructions.substring(0, 150).trim() + (meal.strInstructions.length > 150 ? '...' : '')
      : `Delicious ${meal.strMeal} - A ${meal.strArea || 'popular'} dish`;
    
    // Generate price based on meal complexity (random between 150-500 rupees)
    const priceInPaise = Math.floor(Math.random() * 35000 + 15000);
    
    // Random stock between 10-100
    const stock = Math.floor(Math.random() * 90 + 10);

    const existing = await prisma.item.findFirst({
      where: { name: meal.strMeal },
    });
    
    if (!existing) {
      await prisma.item.create({
        data: {
          name: meal.strMeal,
          description,
          priceInPaise,
          stock,
          categoryId: category.id,
          imageUrl: meal.strMealThumb || null,
        },
      });
      createdCount++;
    } else {
      skippedCount++;
    }
  }

  // Add fallback items
  for (const item of fallbackItems) {
    const existing = await prisma.item.findFirst({
      where: { name: item.name },
    });
    
    if (!existing) {
      await prisma.item.create({
        data: item,
      });
      createdCount++;
    }
  }

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123', 10);
  await prisma.user.upsert({
    where: { email: 'demo@foodmate.com' },
    update: {},
    create: {
      email: 'demo@foodmate.com',
      passwordHash,
    },
  });

  console.log('\n✅ Seeding completed!');
  console.log(`   Created: ${createdCount} items`);
  console.log(`   Skipped: ${skippedCount} items (already exist)`);
  console.log(`   Demo user: demo@foodmate.com / demo123`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });