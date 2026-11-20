"export const menuGroups = [
  {
    id: "pasta",
    label: "THE MAIN EVENT",
    title: "Pasta, with passion.",
    intro: "Twirl into the good stuff. There's always room for one more plate.",
    items: [
      ["Roman Carbonara", "Silky parmesan, crisp pancetta and black pepper."],
      ["Penne Arrabbiata", "Tomato, garlic, olive oil and a little chilli warmth."],
      ["Fettuccine Alfredo", "Wide ribbons folded through velvety parmesan cream."],
      ["House Lasagna", "Tender layers, slow-cooked ragù and a golden top."],
      ["Basil Pesto Fusilli", "Fusilli pasta tossed in fragrant basil pesto."],
      ["Mushroom Tagliatelle", "Silky ribbons with golden mushrooms and herbs."],
      ["Tomato Basil Spaghetti", "Bright tomato sauce, fresh basil and a generous twirl."],
      ["Creamy Garlic Penne", "Penne in mellow garlic cream with parmesan."],
      ["Spaghetti Pomodoro", "Slow-simmered tomato, basil and a little parmesan."],
      ["Penne alla Vodka", "Penne in a silky tomato cream sauce with a little vodka warmth."],
      ["Pesto Gnocchi", "Pillowy gnocchi tossed with vibrant basil pesto."],
      ["Baked Maccheroni", "Golden baked pasta with a bubbling cheese top."]
    ]
  },
  {
    id: "savoury",
    label: "SOMETHING SAVOURY",
    title: "Big bites. Good times.",
    intro: "Burgers, golden fries, fresh salads and all the savoury favourites.",
    items: [
      ["Cheeseburger", "A juicy, satisfying classic with all the right things."],
      ["French Fries", "Crisp edges, fluffy centres, made for sharing."],
      ["Macaroni & Cheese", "Comforting macaroni tucked into rich, creamy cheese."],
      ["Garden Salad", "Fresh greens, colour and a bright, lively finish."],
      ["Double Smash Burger", "Two seared patties, melted cheese and a toasted bun."],
      ["Loaded Cheese Fries", "Crispy fries finished with a generous cheese sauce."],
      ["Chicken Nuggets", "Golden, crunchy chicken bites made for dipping."],
      ["Grilled Chicken Salad", "Fresh greens with savoury grilled chicken."]
    ]
  },
  {
    id: "bakery",
    label: "A LITTLE SOMETHING SWEET",
    title: "Save room for dessert.",
    intro: "Fresh-from-the-oven comforts and sweet things worth slowing down for.",
    items: [
      ["Chocolate Cake", "A soft, rich slice for the sweet-toothed."],
      ["Doughnuts", "Little rings of happiness, finished with a sweet touch."],
      ["Golden Meat Pie", "A flaky Nigerian meat pie with a savoury filling."],
      ["Soft Buns", "Soft, pillowy bakery favourites for any time of day."],
      ["Strawberry Shortcake", "Soft layers, fresh cream and bright strawberries."],
      ["Glazed Bakery Doughnuts", "A soft centre with a glossy sweet finish."],
      ["Butter Croissants", "Flaky, golden layers baked until beautifully crisp."],
      ["Cinnamon Rolls", "Soft swirls with cinnamon warmth and sweet icing."]
    ]
  }
] as const;

export type MenuItem = {
  name: string;
  description: string;
  category: string;
};

export const menuItems: MenuItem[] = menuGroups.flatMap((group) =>
  group.items.map(([name, description]) => ({
    name,
    description,
    category: group.id
  }))
);

export const menuForAssistant = menuItems
  .map((item) => `- ${item.name} (${item.category}): ${item.description}`)
  .join("\\n");
