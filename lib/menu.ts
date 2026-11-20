"export const menuGroups = [
  {
    id: "pasta",
    label: "THE MAIN EVENT",
    title: "Pasta, with passion.",
    intro: "Twirl into the good stuff. There's always room for one more plate.",
    items: [
      ["Roman Carbonara", "Silky parmesan, crisp pancetta and black pepper.", "https://commons.wikimedia.org/wiki/Special:FilePath/Classic-spaghetti-carbonara.jpg?width=1200"],
      ["Penne Arrabbiata", "Tomato, garlic, olive oil and a little chilli warmth.", "https://commons.wikimedia.org/wiki/Special:FilePath/Penne%20Arrabbiata.jpg?width=1200"],
      ["Fettuccine Alfredo", "Wide ribbons folded through velvety parmesan cream.", "https://commons.wikimedia.org/wiki/Special:FilePath/Fettuccine%20Alfredo.jpg?width=1200"],
      ["House Lasagna", "Tender layers, slow-cooked ragù and a golden top.", "https://commons.wikimedia.org/wiki/Special:FilePath/Lasagna%20bolognese.jpg?width=1200"],
      ["Basil Pesto Fusilli", "Fusilli pasta tossed in fragrant basil pesto.", "https://commons.wikimedia.org/wiki/Special:FilePath/Pasta%20al%20pesto%20con%20fagiolini%20e%20patate.jpg?width=1200"],
      ["Mushroom Tagliatelle", "Silky ribbons with golden mushrooms and herbs.", "https://commons.wikimedia.org/wiki/Special:FilePath/Mushroom%20tagliatelle%20at%20Japanese%20Italia-inspired%20family%20restaurant.jpg?width=1200"],
      ["Tomato Basil Spaghetti", "Bright tomato sauce, fresh basil and a generous twirl.", "https://commons.wikimedia.org/wiki/Special:FilePath/Spaghetti%20al%20Pomodoro.JPG?width=1200"],
      ["Creamy Garlic Penne", "Penne in mellow garlic cream with parmesan.", "https://commons.wikimedia.org/wiki/Special:FilePath/Creamy%20white%20sauce%20penne%20pasta.jpg?width=1200"],
      ["Spaghetti Pomodoro", "Slow-simmered tomato, basil and a little parmesan.", "https://commons.wikimedia.org/wiki/Special:FilePath/Spaghetti%20e%20pomodoro.jpg?width=1200"],
      ["Penne alla Vodka", "Penne in a silky tomato cream sauce with a little vodka warmth.", "https://commons.wikimedia.org/wiki/Special:FilePath/Penne%20alla%20Vodka.jpg?width=1200"],
      ["Pesto Gnocchi", "Pillowy gnocchi tossed with vibrant basil pesto.", "https://commons.wikimedia.org/wiki/Special:FilePath/Gnocchi%20al%20pesto%2001.jpg?width=1200"],
      ["Baked Maccheroni", "Golden baked pasta with a bubbling cheese top.", "https://commons.wikimedia.org/wiki/Special:FilePath/Baked%20Macaroni.jpg?width=1200"]
    ]
  },
  {
    id: "savoury",
    label: "SOMETHING SAVOURY",
    title: "Big bites. Good times.",
    intro: "Burgers, golden fries, fresh salads and all the savoury favourites.",
    items: [
      ["Cheeseburger", "A juicy, satisfying classic with all the right things.", "https://commons.wikimedia.org/wiki/Special:FilePath/Cheeseburger.jpg?width=1200"],
      ["French Fries", "Crisp edges, fluffy centres, made for sharing.", "https://commons.wikimedia.org/wiki/Special:FilePath/French%20Fries.jpg?width=1200"],
      ["Macaroni & Cheese", "Comforting macaroni tucked into rich, creamy cheese.", "https://commons.wikimedia.org/wiki/Special:FilePath/Baked%20macaroni%20and%20cheese%201.jpg?width=1200"],
      ["Garden Salad", "Fresh greens, colour and a bright, lively finish.", "https://commons.wikimedia.org/wiki/Special:FilePath/Garden%20salad.jpg?width=1200"],
      ["Double Smash Burger", "Two seared patties, melted cheese and a toasted bun.", "https://commons.wikimedia.org/wiki/Special:FilePath/Smashburger.jpg?width=1200"],
      ["Loaded Cheese Fries", "Crispy fries finished with a generous cheese sauce.", "https://commons.wikimedia.org/wiki/Special:FilePath/Cheese%20Fries.jpg?width=1200"],
      ["Chicken Nuggets", "Golden, crunchy chicken bites made for dipping.", "https://commons.wikimedia.org/wiki/Special:FilePath/Chicken%20nuggets.jpg?width=1200"],
      ["Grilled Chicken Salad", "Fresh greens with savoury grilled chicken.", "https://commons.wikimedia.org/wiki/Special:FilePath/Grilled%20Chicken%20Fattoush%20Salad.jpg?width=1200"]
    ]
  },
  {
    id: "bakery",
    label: "A LITTLE SOMETHING SWEET",
    title: "Save room for dessert.",
    intro: "Fresh-from-the-oven comforts and sweet things worth slowing down for.",
    items: [
      ["Chocolate Cake", "A soft, rich slice for the sweet-toothed.", "https://commons.wikimedia.org/wiki/Special:FilePath/ChocolateCake.jpg?width=1200"],
      ["Doughnuts", "Little rings of happiness, finished with a sweet touch.", "https://commons.wikimedia.org/wiki/Special:FilePath/Donut%20assortment.jpg?width=1200"],
      ["Golden Meat Pie", "A flaky Nigerian meat pie with a savoury filling.", "https://commons.wikimedia.org/wiki/Special:FilePath/Meat%20pie%20in%20Northern%20Nigeria.jpg?width=1200"],
      ["Soft Buns", "Soft, pillowy bakery favourites for any time of day.", "https://commons.wikimedia.org/wiki/Special:FilePath/Bun%20Bread.jpg?width=1200"],
      ["Strawberry Shortcake", "Soft layers, fresh cream and bright strawberries.", "https://commons.wikimedia.org/wiki/Special:FilePath/Strawberry%20shortcake.jpg?width=1200"],
      ["Glazed Bakery Doughnuts", "A soft centre with a glossy sweet finish.", "https://commons.wikimedia.org/wiki/Special:FilePath/Glazed%20doughnut.jpg?width=1200"],
      ["Butter Croissants", "Flaky, golden layers baked until beautifully crisp.", "https://commons.wikimedia.org/wiki/Special:FilePath/Croissants.jpg?width=1200"],
      ["Cinnamon Rolls", "Soft swirls with cinnamon warmth and sweet icing.", "https://commons.wikimedia.org/wiki/Special:FilePath/Cinnamon-Roll-US-Bakery.jpg?width=1200"]
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
