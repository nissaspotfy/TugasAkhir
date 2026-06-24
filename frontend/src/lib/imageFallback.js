export const getFallbackFoodImage = (menuName = "") => {
    const name = menuName.toLowerCase();
    if (name.includes("tomyum") || name.includes("tom yum")) {
        return "https://images.unsplash.com/photo-1548940740-204726a19db3?w=500&auto=format&fit=crop&q=80"; // Tom Yum / Soup
    }
    if (name.includes("pisang") || name.includes("banana")) {
        return "https://images.unsplash.com/photo-1566393028639-d108a42c46a7?w=500&auto=format&fit=crop&q=80"; // Banana dessert
    }
    if (name.includes("mie") || name.includes("noodle") || name.includes("ramen") || name.includes("telor")) {
        return "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80"; // Noodles/Mie
    }
    if (name.includes("kimbab") || name.includes("gimbap") || name.includes("sushi")) {
        return "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=80"; // Kimbab/Sushi
    }
    if (name.includes("nasi kepal") || name.includes("onigiri") || name.includes("rice ball")) {
        return "https://images.unsplash.com/photo-1618090584126-129cd1f3fbaa?w=500&auto=format&fit=crop&q=80"; // Onigiri/Rice ball
    }
    if (name.includes("nasi goreng") || name.includes("nasi")) {
        return "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&auto=format&fit=crop&q=80"; // Fried Rice
    }
    if (name.includes("roti") || name.includes("canai")) {
        return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80"; // Roti Canai
    }
    if (name.includes("seblak")) {
        return "https://images.unsplash.com/photo-1555126634-323283e090fa?w=500&auto=format&fit=crop&q=80"; // Spicy food
    }
    if (name.includes("teh") || name.includes("tea") || name.includes("es")) {
        return "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80"; // Iced Tea
    }
    if (name.includes("ayam")) {
        return "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=500&auto=format&fit=crop&q=80"; // Ayam Bakar
    }
    return "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=80"; // General food fallback
};

export const handleImageError = (e, name) => {
    e.target.src = getFallbackFoodImage(name);
};
