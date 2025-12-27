import { Card } from '@/shared/ui/Card';

export function MoodMap() {
    return (
        <Card className="w-full h-64 flex items-center justify-center bg-blue-50 border-blue-100">
            <p className="text-gray-500">
                🗺️ Mood Map Visualization (Placeholder)<br />
                <span className="text-sm">지도 라이브러리 연동 예정</span>
            </p>
        </Card>
    );
}
