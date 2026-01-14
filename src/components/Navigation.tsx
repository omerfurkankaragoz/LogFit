import React from 'react';
import { CalendarRange, Radar, LibraryBig, LineChart } from 'lucide-react';

interface NavigationProps {
    activeTab: string;
    onTabChange: (tab: any) => void;
}

const tabs = [
    { id: 'calendar', name: 'Takvim', icon: CalendarRange },
    { id: 'routines', name: 'Rutinler', icon: Radar },
    { id: 'library', name: 'Kütüphane', icon: LibraryBig },
    { id: 'progress', name: 'İlerleme', icon: LineChart },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-[90%] md:max-w-md">
            <div className="glass-float rounded-full px-1 py-2 flex justify-around items-center">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-full transition-all duration-300 ${isActive
                                ? 'text-apple-blue'
                                : 'text-apple-light-text-secondary dark:text-apple-dark-text-secondary hover:text-apple-light-text-primary dark:hover:text-apple-dark-text-primary'
                                }`}
                        >
                            <Icon
                                className={`transition-transform duration-300 mb-0.5 ${isActive ? 'scale-110' : 'scale-100'}`}
                                size={22}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-apple-blue' : ''}`}>
                                {tab.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
