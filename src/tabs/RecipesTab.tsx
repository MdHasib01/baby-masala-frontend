import React, { useState } from 'react';
import { Recipe, Product } from '../types';
import { babyCareService } from '../services/babyCareService';
import { errorMessage } from '../services/api';
import { Search, Utensils, Play, Bookmark, Check, ShoppingBag, Clock, X } from 'lucide-react';

interface RecipesTabProps {
  recipes: Recipe[];
  onUpdateRecipes: (recipes: Recipe[]) => void;
  products: Product[];
  onOpenProduct: (product: Product) => void;
  selectedRecipeModal?: Recipe | null;
  onCloseModal?: () => void;
}

export const RecipesTab: React.FC<RecipesTabProps> = ({
  recipes,
  onUpdateRecipes,
  products,
  onOpenProduct,
  selectedRecipeModal,
  onCloseModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(selectedRecipeModal || null);

  const ageFilters = [
    { id: 'all', label: 'সকল বয়স' },
    { id: '6_8m', label: '৬-৮ মাস' },
    { id: '9_12m', label: '৯-১২ মাস' },
    { id: '1_2y', label: '১-২ বছর' },
    { id: '2y_plus', label: '২ বছর+' },
  ];

  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAge = selectedAge === 'all' || r.ageGroup === selectedAge;
    return matchesSearch && matchesAge;
  });

  const handleToggleSave = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { recipe } = await babyCareService.toggleSaveRecipe(id);
      onUpdateRecipes(recipes.map((r) => (r.id === id ? recipe : r)));
      if (activeRecipe && activeRecipe.id === id) setActiveRecipe(recipe);
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const linkedProduct = activeRecipe?.shopProductId
    ? products.find((p) => p.id === activeRecipe.shopProductId)
    : null;

  return (
    <div className="pb-24 max-w-xl mx-auto px-4 pt-4 space-y-4">
      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="রেসিপি বা উপকরণ দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#EDD6A9] rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#56020A]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ageFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedAge(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedAge === f.id
                  ? 'bg-[#56020A] text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-[#EDD6A9]/30 border border-[#EDD6A9]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredRecipes.map((rec) => (
          <div
            key={rec.id}
            onClick={() => setActiveRecipe(rec)}
            className="bg-white rounded-2xl border border-[#EDD6A9]/60 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col"
          >
            <div className="relative h-40 overflow-hidden bg-gray-100">
              <img
                src={rec.image}
                alt={rec.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2.5 left-2.5 bg-[#56020A]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                {rec.ageGroupLabel}
              </span>
              <button
                onClick={(e) => handleToggleSave(rec.id, e)}
                className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-sm transition-colors ${
                  rec.saved ? 'bg-[#56020A] text-white' : 'bg-white/80 text-gray-700 hover:bg-white'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${rec.saved ? 'fill-white' : ''}`} />
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-sm font-bold text-[#56020A] group-hover:text-[#375013] transition-colors">
                  {rec.title}
                </h3>
                <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                  <Clock className="w-3.5 h-3.5 text-[#375013]" /> প্রস্তুতি সময়: {rec.prepTime}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#375013]">
                <span>রেসিপি দেখুন</span>
                <Play className="w-3.5 h-3.5 fill-[#375013]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      {activeRecipe && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#EDD6A9] overflow-hidden">
            <div className="relative h-48 bg-gray-900 shrink-0">
              <img src={activeRecipe.image} alt={activeRecipe.title} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">
                <div>
                  <span className="bg-[#D6AA4F] text-[#56020A] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {activeRecipe.ageGroupLabel}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1.5">{activeRecipe.title}</h2>
                </div>
              </div>
              <button
                onClick={() => setActiveRecipe(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-[#56020A] text-sm mb-2">প্রয়োজনীয় উপকরণ:</h4>
                <ul className="grid grid-cols-1 gap-1.5">
                  {activeRecipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-[#EDD6A9]/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#375013]" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-[#56020A] text-sm mb-2">প্রস্তুত প্রণালী:</h4>
                <ol className="space-y-2">
                  {activeRecipe.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-[#EDD6A9]/50">
                      <span className="font-bold text-[#375013]">{idx + 1}.</span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-1">
                <p className="font-bold text-amber-900">টেকচার ও সার্ভিং নোট:</p>
                <p className="text-amber-800">{activeRecipe.textureNotes}</p>
                <p className="font-bold text-amber-900 mt-2">এলার্জেন সতর্কতা:</p>
                <p className="text-amber-800">{activeRecipe.allergens}</p>
              </div>

              {linkedProduct && (
                <div className="bg-white p-3.5 rounded-xl border border-[#EDD6A9] flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <img src={linkedProduct.image} alt={linkedProduct.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-[10px] text-gray-400">এই রেসিপিতে ব্যবহৃত</p>
                      <h5 className="font-bold text-[#56020A]">{linkedProduct.name}</h5>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveRecipe(null);
                      onOpenProduct(linkedProduct);
                    }}
                    className="px-3 py-1.5 bg-[#56020A] text-white font-bold rounded-lg hover:bg-[#56020A]/90 flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> কিনুন
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
