import { useVoteStore } from '../model/useVoteStore';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export function GenderSelector() {
    const t = useTranslations('vote.gender');
    const setGender = useVoteStore((state) => state.setGender);

    return (
        <div className="flex flex-col gap-6 w-full max-w-sm">
            <h2 className="text-2xl font-bold text-center text-gray-800">
                {t('question')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card
                        className="cursor-pointer hover:bg-blue-50 flex flex-col items-center gap-4 py-8"
                        onClick={() => setGender('male')}
                    >
                        <span className="text-4xl">👨</span>
                        <span className="text-lg font-medium text-gray-700">{t('male')}</span>
                    </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card
                        className="cursor-pointer hover:bg-pink-50 flex flex-col items-center gap-4 py-8"
                        onClick={() => setGender('female')}
                    >
                        <span className="text-4xl">👩</span>
                        <span className="text-lg font-medium text-gray-700">{t('female')}</span>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
