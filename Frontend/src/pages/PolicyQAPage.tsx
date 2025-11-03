import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  BookOpen,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Send
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'coverage' | 'claims' | 'exclusions' | 'general';
}

interface ClaimScenario {
  id: string;
  title: string;
  description: string;
  outcome: 'approved' | 'rejected' | 'partial';
  reasoning: string;
  coverage_type: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'What types of medical expenses are covered?',
    answer: 'Our policy covers emergency medical expenses, hospitalization, doctor consultations, prescription medications, diagnostic tests, and surgery. Coverage includes both inpatient and outpatient care up to your policy limits.',
    category: 'coverage'
  },
  {
    id: '2',
    question: 'How long does claim processing typically take?',
    answer: 'Standard claims are processed within 5-7 business days. Emergency claims receive priority processing within 24-48 hours. Complex cases requiring additional documentation may take up to 14 business days.',
    category: 'claims'
  },
  {
    id: '3',
    question: 'Are pre-existing conditions covered?',
    answer: 'Pre-existing conditions are covered after a waiting period of 12 months from policy inception. Emergency treatment for pre-existing conditions may have different coverage terms. Please review your specific policy documents.',
    category: 'exclusions'
  },
  {
    id: '4',
    question: 'What is the maximum claim amount?',
    answer: 'The maximum claim amount depends on your chosen policy tier: Basic ($50,000), Standard ($100,000), Premium ($250,000), or Elite ($500,000). Annual limits reset each policy year.',
    category: 'coverage'
  },
  {
    id: '5',
    question: 'How do I submit supporting documents?',
    answer: 'Documents can be submitted through our secure upload portal. We accept PDF, JPG, and PNG formats. Required documents include medical bills, prescriptions, doctor reports, and discharge summaries.',
    category: 'claims'
  },
  {
    id: '6',
    question: 'Are cosmetic procedures covered?',
    answer: 'Cosmetic procedures are generally not covered unless medically necessary following an accident or injury. Reconstructive surgery after covered medical procedures may be eligible for coverage.',
    category: 'exclusions'
  },
  {
    id: '7',
    question: 'What is the deductible amount?',
    answer: 'Deductibles vary by policy tier: Basic ($1,000), Standard ($500), Premium ($250), Elite ($100). The deductible applies per policy year, not per claim.',
    category: 'general'
  },
  {
    id: '8',
    question: 'Can I appeal a rejected claim?',
    answer: 'Yes, you can appeal any rejected claim within 30 days of the decision. Submit additional documentation or clarification through our appeals portal. Appeals are reviewed by a different claims adjuster.',
    category: 'claims'
  }
];

const claimScenarios: ClaimScenario[] = [
  {
    id: '1',
    title: 'Emergency Room Visit for Broken Arm',
    description: 'Patient visited ER after falling from bicycle, required X-rays and cast application.',
    outcome: 'approved',
    reasoning: 'Emergency medical treatment for accidental injury is covered under the policy. All submitted documentation was complete and treatment was medically necessary.',
    coverage_type: 'Emergency Care'
  },
  {
    id: '2',
    title: 'Elective Cosmetic Surgery',
    description: 'Patient requested coverage for rhinoplasty for aesthetic purposes.',
    outcome: 'rejected',
    reasoning: 'Cosmetic procedures performed solely for aesthetic purposes are explicitly excluded from coverage. No medical necessity was documented.',
    coverage_type: 'Cosmetic Surgery'
  },
  {
    id: '3',
    title: 'Prescription Medication Refill',
    description: 'Monthly refill of prescribed blood pressure medication.',
    outcome: 'approved',
    reasoning: 'Prescription medications for chronic condition management are covered. Valid prescription and pharmacy receipt provided.',
    coverage_type: 'Prescription Drugs'
  },
  {
    id: '4',
    title: 'Experimental Cancer Treatment',
    description: 'Patient seeking coverage for clinical trial treatment not FDA approved.',
    outcome: 'rejected',
    reasoning: 'Policy excludes experimental and investigational treatments. Treatment must be FDA approved and recognized as standard care.',
    coverage_type: 'Experimental Treatment'
  },
  {
    id: '5',
    title: 'Physical Therapy After Surgery',
    description: '12 sessions of physical therapy following knee replacement surgery.',
    outcome: 'partial',
    reasoning: 'Policy covers up to 10 physical therapy sessions post-surgery. Sessions 1-10 approved, sessions 11-12 require pre-authorization.',
    coverage_type: 'Rehabilitation'
  },
  {
    id: '6',
    title: 'Annual Preventive Health Checkup',
    description: 'Routine annual physical exam including blood work.',
    outcome: 'approved',
    reasoning: 'One annual preventive health screening is fully covered under wellness benefits. No deductible applies.',
    coverage_type: 'Preventive Care'
  }
];

export const PolicyQAPage = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; message: string }>>([
    {
      role: 'assistant',
      message: 'Hello! I\'m your policy assistant. Ask me anything about your insurance coverage, claims process, or policy details.'
    }
  ]);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    setChatHistory([...chatHistory,
      { role: 'user', message: chatMessage },
      { role: 'assistant', message: 'I\'m a demo assistant. In production, I would analyze your uploaded policy documents to answer: "' + chatMessage + '". Please upload your policy documents first to enable AI-powered responses.' }
    ]);
    setChatMessage('');
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'approved': return <CheckCircle className="w-5 h-5" />;
      case 'rejected': return <XCircle className="w-5 h-5" />;
      case 'partial': return <AlertCircle className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Policy Q&A Hub</h1>
              <p className="text-xl text-gray-600 mt-1">
                Get instant answers about your coverage, claims, and policy details
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Frequently Asked Questions
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search FAQs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {['all', 'coverage', 'claims', 'exclusions', 'general'].map((category) => (
                      <Badge
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`cursor-pointer transition-colors ${
                          selectedCategory === category
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredFAQs.map((faq) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        {expandedFAQ === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedFAQ === faq.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-gray-200"
                          >
                            <div className="px-4 py-4 bg-gray-50 text-gray-700">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>

                {filteredFAQs.length === 0 && (
                  <div className="text-center py-12">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No FAQs found matching your search.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Policy Chatbot
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-96 min-h-[300px]">
                  {chatHistory.map((chat, index) => (
                    <div
                      key={index}
                      className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          chat.role === 'user'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{chat.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Ask about your policy..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Upload policy documents to enable AI-powered responses
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Common Claim Scenarios
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Learn from real-world examples of claim decisions
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {claimScenarios.map((scenario) => (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{scenario.title}</h3>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${getOutcomeColor(scenario.outcome)}`}>
                        {getOutcomeIcon(scenario.outcome)}
                        <span className="capitalize font-medium">{scenario.outcome}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>

                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs">
                        {scenario.coverage_type}
                      </Badge>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Decision Reasoning:</p>
                      <p className="text-xs text-gray-600">{scenario.reasoning}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Need More Information?</h3>
                <p className="text-gray-600 mb-6">
                  Upload your policy documents to get personalized answers based on your specific coverage
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => window.location.href = '/upload'}>
                    Upload Policy Documents
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/query'}>
                    Ask a Question
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
