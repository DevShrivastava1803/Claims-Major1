import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Brain, Shield, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI-Powered Analysis',
      description: 'Advanced language models analyze your insurance claims with human-like understanding',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Instant Processing',
      description: 'Get claim decisions in seconds, not days. Upload and query your documents instantly',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Policy Compliance',
      description: 'Every decision is backed by specific policy clauses and regulations',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Smart Analytics',
      description: 'Track claim patterns, approval rates, and trends with comprehensive dashboards',
    },
  ];

  const benefits = [
    'Reduce claim processing time by 90%',
    'Improve decision accuracy and consistency',
    'Lower operational costs significantly',
    'Enhance customer satisfaction',
    'Ensure policy compliance automatically',
    'Scale effortlessly with demand',
  ];

  return (
    <div className="min-h-screen">
      <section className="gradient-background min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-block mb-8"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FileText className="w-20 h-20 text-secondary mx-auto" />
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
              AI Insurance Claim Assistant
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-2xl mx-auto">
              Intelligent claim analysis using large language models
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button
                size="lg"
                onClick={() => navigate('/upload')}
                className="text-lg"
              >
                Upload Policy Document
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need for intelligent claim processing</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="text-secondary mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-accent/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Why Choose Our Platform?</h2>
              <p className="text-lg text-gray-700 mb-8">
                Transform your insurance claim processing with cutting-edge AI technology that delivers accuracy, speed, and reliability.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-secondary/20">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="border-t pt-6">
                    <div className="h-3 bg-gray-100 rounded mb-3"></div>
                    <div className="h-3 bg-gray-100 rounded w-5/6 mb-3"></div>
                    <div className="h-3 bg-gray-100 rounded w-4/6"></div>
                  </div>
                  <div className="flex space-x-3">
                    <div className="h-10 bg-secondary rounded-lg flex-1"></div>
                    <div className="h-10 bg-support rounded-lg flex-1"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Upload your first policy document and experience the power of AI-driven insurance claim processing
          </p>
          <Button size="lg" onClick={() => navigate('/upload')}>
            Start Processing Claims
          </Button>
        </motion.div>
      </section>
    </div>
  );
};
