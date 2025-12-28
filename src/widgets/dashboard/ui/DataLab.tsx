import { DashboardStats } from '../actions/getDashboardStats';
import { Card } from '@/shared/ui/Card';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface DataLabProps {
    stats: DashboardStats | null;
    onClose: () => void;
}

export function DataLab({ stats, onClose }: DataLabProps) {
    if (!stats) return null;

    const maleScore = stats.male.score;
    const femaleScore = stats.female.score;
    const t = useTranslations('dashboard');

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                layoutId="report-card"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">📊 {t('datalab.title')}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        ✕
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Gender Balance */}
                    <div>
                        <h4 className="text-sm text-gray-500 font-bold mb-3">{t('datalab.gender_gap')}</h4>
                        <div className="flex gap-4">
                            <Card className="flex-1 bg-blue-50 border-blue-100 p-4 flex flex-col items-center">
                                <span className="text-2xl mb-1">👨</span>
                                <span className="text-sm text-gray-500">{t('datalab.male')}</span>
                                <span className="text-xl font-bold text-blue-600">{maleScore}%</span>
                            </Card>
                            <Card className="flex-1 bg-pink-50 border-pink-100 p-4 flex flex-col items-center">
                                <span className="text-2xl mb-1">👩</span>
                                <span className="text-sm text-gray-500">{t('datalab.female')}</span>
                                <span className="text-xl font-bold text-pink-600">{femaleScore}%</span>
                            </Card>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg text-xs text-gray-500 text-center">
                        {t('datalab.coming_soon')}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
