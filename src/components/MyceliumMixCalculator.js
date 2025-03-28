import React, { useState, useEffect, useCallback } from 'react';
import MyceliumDataService from '../services/MyceliumDataService';
import UserDataService from '../services/UserDataService';
import RecommendationService from '../services/RecommendationService';
import Header from './Header';
import ResultsPanel from './ResultsPanel';
import RecommendationsPanel from './RecommendationsPanel';
/* Temporarily hidden AI Cultivation Advisor */
/* import AIAdvicePanel from './AIAdvicePanel'; */
import MushroomFactsPanel from './MushroomFactsPanel';

const MyceliumMixCalculator = () => {
    // State to track UI updates
    const [, setUpdateTrigger] = useState(0);
    // State to track if form is complete
    const [isFormComplete, setIsFormComplete] = useState(false);
    // State to track if recommendations are loaded
    const [recommendationsLoaded, setRecommendationsLoaded] = useState(false);
    // State to track if user has lost focus after making a selection
    const [hasLostFocus, setHasLostFocus] = useState(false);
    
    // Check if all form fields have been filled out and load recommendations if needed
    const checkFormCompletion = useCallback((data) => {
        const isComplete = 
            data.experienceLevel && 
            data.spawnAmount > 0 && 
            data.substrateRatio > 0 && 
            data.substrateType && 
            data.containerSize > 0;
        
        setIsFormComplete(isComplete);
        
        // If form is complete and recommendations aren't loaded yet, load them
        if (isComplete && !recommendationsLoaded) {
            // Load recommendations from OpenAI
            const loadRecommendations = async () => {
                try {
                    await RecommendationService.getPersonalizedRecommendations(true);
                    setRecommendationsLoaded(true);
                } catch (error) {
                    console.error('Error loading recommendations:', error);
                }
            };
            
            loadRecommendations();
        }
    }, [recommendationsLoaded]);
    
    // Load data from UserDataService on component mount
    useEffect(() => {
        // Try to load saved data from localStorage
        UserDataService.loadFromLocalStorage();
        // Force a re-render to display the loaded data
        setUpdateTrigger(prev => prev + 1);
        // Check if form is already complete from saved data
        checkFormCompletion(UserDataService.getUserData());
    }, [checkFormCompletion]);
    
    // Get current values from UserDataService
    const userData = UserDataService.getUserData();
    const results = UserDataService.getResults();
    const recommendations = UserDataService.getRecommendations();
    
    // Handler functions for form inputs
    const handleExperienceLevelChange = (e) => {
        UserDataService.updateUserData('experienceLevel', e.target.value);
        setUpdateTrigger(prev => prev + 1);
        checkFormCompletion({...userData, experienceLevel: e.target.value});
    };
    
    const handleSpawnAmountChange = (e) => {
        const value = parseFloat(e.target.value) || 0;
        UserDataService.updateUserData('spawnAmount', value);
        setUpdateTrigger(prev => prev + 1);
        checkFormCompletion({...userData, spawnAmount: value});
    };
    
    const handleSubstrateRatioChange = (e) => {
        const value = parseInt(e.target.value);
        UserDataService.updateUserData('substrateRatio', value);
        setUpdateTrigger(prev => prev + 1);
        checkFormCompletion({...userData, substrateRatio: value});
    };
    
    const handleSubstrateTypeChange = (e) => {
        UserDataService.updateUserData('substrateType', e.target.value);
        setUpdateTrigger(prev => prev + 1);
        checkFormCompletion({...userData, substrateType: e.target.value});
    };
    
    const handleContainerSizeChange = (e) => {
        const value = parseFloat(e.target.value);
        UserDataService.updateUserData('containerSize', value);
        setUpdateTrigger(prev => prev + 1);
        checkFormCompletion({...userData, containerSize: value});
    };
    
    const handleSaveData = () => {
        const success = UserDataService.saveToLocalStorage();
        alert(success ? 'Settings saved successfully!' : 'Failed to save settings');
    };
    
    const handleResetData = () => {
        if (window.confirm('Are you sure you want to reset to default values?')) {
            UserDataService.resetToDefaults();
            RecommendationService.resetRequestLimits(); // Reset API request limits
            setRecommendationsLoaded(false);
            setIsFormComplete(false);
            setHasLostFocus(false); // Reset the focus state as well
            setUpdateTrigger(prev => prev + 1);
        }
    };

    // Handle blur event for any input to check form completion
    const handleInputBlur = () => {
        checkFormCompletion(userData);
        setHasLostFocus(true);
    };

    return (
        <div className="card custom-grid-2">
            <div>
                <Header 
                    title="SpawnSmart" 
                    description="Your intelligent calculator for perfect mushroom cultivation - optimize spawn-to-substrate ratios for maximum yields, faster colonization, and professional results." 
                />

                <div className="mt-6">
                    <label>Experience Level</label>
                    <select 
                        className="input mt-1 w-full" 
                        value={userData.experienceLevel} 
                        onChange={handleExperienceLevelChange}
                        onBlur={handleInputBlur}
                    >
                        {MyceliumDataService.experienceLevels.map(level => (
                            <option key={level.id} value={level.id}>{level.label}</option>
                        ))}
                    </select>
                </div>

                <div className="mt-6">
                    <label>Spawn Amount (quarts)</label>
                    <input 
                        type="number" 
                        className="input mt-1 w-full" 
                        value={userData.spawnAmount} 
                        onChange={handleSpawnAmountChange} 
                        onBlur={handleInputBlur}
                    />
                </div>

                <div className="mt-6">
                    <label>Substrate Ratio (1:{userData.substrateRatio})</label>
                    <input 
                        type="range" 
                        className="slider mt-1 w-full" 
                        min="1" 
                        max="6" 
                        value={userData.substrateRatio} 
                        onChange={handleSubstrateRatioChange} 
                        onBlur={handleInputBlur}
                    />
                </div>

                <div className="mt-6">
                    <label>Substrate Type</label>
                    <select 
                        className="input mt-1 w-full" 
                        value={userData.substrateType} 
                        onChange={handleSubstrateTypeChange}
                        onBlur={handleInputBlur}
                    >
                        {MyceliumDataService.substrateTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                    </select>
                </div>

                <div className="mt-6 mb-4">
                    <label>Container Size (quarts)</label>
                    <select 
                        className="input mt-1 w-full" 
                        value={userData.containerSize} 
                        onChange={handleContainerSizeChange}
                        onBlur={handleInputBlur}
                    >
                        {MyceliumDataService.containerSizes.map(container => (
                            <option key={container.size} value={container.size}>
                                {container.label} - {container.description}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="mt-6 mb-6 flex gap-2">
                    <button 
                        className="btn btn-primary w-1/2" 
                        onClick={handleSaveData}
                    >
                        Save Settings
                    </button>
                    <button 
                        className="btn btn-secondary w-1/2" 
                        onClick={handleResetData}
                    >
                        Reset to Defaults
                    </button>
                </div>
            </div>

            <div>
                <ResultsPanel results={results} ingredients={results.ingredients} />
                
                {isFormComplete && recommendationsLoaded && hasLostFocus ? (
                    <RecommendationsPanel 
                        recommendations={recommendations} 
                        cultivationTips={MyceliumDataService.cultivationTips.slice(0, 6)} 
                        userData={userData}
                    />
                ) : (
                    <MushroomFactsPanel />
                )}
                
                {/* Temporarily hidden AI Cultivation Advisor */}
                {/* <AIAdvicePanel userData={userData} /> */}
            </div>
        </div>
    );
};

export default MyceliumMixCalculator;
