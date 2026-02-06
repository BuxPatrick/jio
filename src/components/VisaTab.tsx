import { useState } from 'react';
import { visaTypes, VisaType } from '../data/visaData';
import { VisaChatAgent } from './VisaChatAgent';
import { 
  Briefcase, 
  GraduationCap, 
  Plane, 
  Users, 
  Trophy, 
  Globe, 
  Building2,
  DollarSign,
  Clock,
  ArrowRight,
  Bot,
  Filter,
  Search
} from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  'Employment': <Briefcase size={20} />,
  'Student': <GraduationCap size={20} />,
  'Tourist': <Plane size={20} />,
  'Family': <Users size={20} />,
  'Other': <Globe size={20} />
};

const categoryColors: Record<string, string> = {
  'Employment': 'bg-blue-100 text-blue-700 border-blue-200',
  'Student': 'bg-green-100 text-green-700 border-green-200',
  'Tourist': 'bg-purple-100 text-purple-700 border-purple-200',
  'Family': 'bg-pink-100 text-pink-700 border-pink-200',
  'Other': 'bg-orange-100 text-orange-700 border-orange-200'
};

export function VisaTab() {
  const [selectedVisa, setSelectedVisa] = useState<VisaType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(visaTypes.map(v => v.category)))];

  const filteredVisas = visaTypes.filter(visa => {
    const matchesSearch = visa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visa.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || visa.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedVisa) {
    return (
      <div className="space-y-4">
        <VisaChatAgent 
          visa={selectedVisa} 
          onBack={() => setSelectedVisa(null)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">VISA Availability</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore U.S. visa options and check your eligibility with our interactive visa agent. 
          Select a visa type below to get started.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search visa types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter size={20} className="text-gray-500 flex-shrink-0" />
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>{visaTypes.filter(v => v.category === 'Employment').length} Employment</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{visaTypes.filter(v => v.category === 'Student').length} Student</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span>{visaTypes.filter(v => v.category === 'Tourist').length} Tourist</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
          <span>{visaTypes.filter(v => v.category === 'Family').length} Family</span>
        </div>
      </div>

      {/* Visa Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVisas.map((visa) => (
          <div
            key={visa.id}
            onClick={() => setSelectedVisa(visa)}
            className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{visa.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {visa.name}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                      categoryColors[visa.category]
                    }`}>
                      {categoryIcons[visa.category]}
                      {visa.category}
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600" />
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2">
                {visa.description}
              </p>

              {/* Quick Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span className="truncate max-w-[100px]">{visa.processingTime.split(' ')[0]}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign size={14} />
                  <span className="truncate">{visa.fee.split(' ')[0]}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bot size={14} />
                  <span>{visa.questions.length} questions</span>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 group-hover:shadow-md">
                <Bot size={16} />
                Check Eligibility
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVisas.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No visas found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Info Footer */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bot size={24} className="text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">How the Visa Eligibility Agent Works</h4>
            <p className="text-sm text-blue-700">
              Our interactive agent will ask you a series of questions specific to each visa type. 
              Based on your answers, it will determine your potential eligibility and provide you with 
              a complete list of required documents, processing times, and fees. This is a preliminary 
              assessment - always consult with an immigration attorney for professional advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
