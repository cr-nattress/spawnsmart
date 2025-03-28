import React, { useState, useEffect, useCallback } from 'react';
import MyceliumDataService from '../services/MyceliumDataService';
import UserDataService from '../services/UserDataService';
import RecommendationService from '../services/RecommendationService';
import LoggingService from '../services/LoggingService';
import Header from './Header';
import ResultsPanel from './ResultsPanel';
import RecommendationsPanel from './RecommendationsPanel';
/* Temporarily hidden AI Cultivation Advisor */
/* import AIAdvicePanel from './AIAdvicePanel'; */
import MushroomFactsPanel from './MushroomFactsPanel';
import SubstrateSupplierLinks from './SubstrateSupplierLinks';

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
                    LoggingService.info('Loading recommendations after form completion', {
                        experienceLevel: data.experienceLevel,
                        substrateType: data.substrateType
                    });
                    
                    await RecommendationService.getPersonalizedRecommendations(true);
                    setRecommendationsLoaded(true);
                    
                    LoggingService.info('Recommendations loaded successfully');
                } catch (error) {
                    LoggingService.logError(error, 'Error loading recommendations after form completion');
                    setRecommendationsLoaded(false);
                }
            };
            
            loadRecommendations();
        }
    }, [recommendationsLoaded]);
    
    // Load data from UserDataService on component mount
    useEffect(() => {
        LoggingService.info('MyceliumMixCalculator mounted');
        
        try {
            // Try to load saved data from localStorage
            UserDataService.loadFromLocalStorage();
            // Force a re-render to display the loaded data
            setUpdateTrigger(prev => prev + 1);
            // Check if form is already complete from saved data
            checkFormCompletion(UserDataService.getUserData());
            
            LoggingService.info('User data loaded from localStorage', {
                experienceLevel: UserDataService.getUserData().experienceLevel
            });
        } catch (error) {
            LoggingService.logError(error, 'Error loading user data from localStorage');
        }
        
        // Track component view as a metric
        LoggingService.sendMetric('calculator_view', 1);
        
        return () => {
            LoggingService.debug('MyceliumMixCalculator unmounted');
        };
    }, [checkFormCompletion]);
    
    // Get current values from UserDataService
    const userData = UserDataService.getUserData();
    const results = UserDataService.getResults();
    const recommendations = UserDataService.getRecommendations();
    
    // Handler functions for form inputs
    const handleExperienceLevelChange = (e) => {
        try {
            const newValue = e.target.value;
            UserDataService.updateUserData('experienceLevel', newValue);
            setUpdateTrigger(prev => prev + 1);
            checkFormCompletion({...userData, experienceLevel: newValue});
            
            LoggingService.info('User changed experience level', { newValue });
            LoggingService.sendMetric('experience_level_change', 1, { level: newValue });
        } catch (error) {
            LoggingService.logError(error, 'Error updating experience level');
        }
    };
    
    const handleSpawnAmountChange = (e) => {
        try {
            const value = parseFloat(e.target.value) || 0;
            UserDataService.updateUserData('spawnAmount', value);
            setUpdateTrigger(prev => prev + 1);
            checkFormCompletion({...userData, spawnAmount: value});
            
            LoggingService.debug('User changed spawn amount', { value });
        } catch (error) {
            LoggingService.logError(error, 'Error updating spawn amount');
        }
    };
    
    const handleSubstrateRatioChange = (e) => {
        try {
            const value = parseInt(e.target.value);
            UserDataService.updateUserData('substrateRatio', value);
            setUpdateTrigger(prev => prev + 1);
            checkFormCompletion({...userData, substrateRatio: value});
            
            LoggingService.debug('User changed substrate ratio', { value });
        } catch (error) {
            LoggingService.logError(error, 'Error updating substrate ratio');
        }
    };
    
    const handleSubstrateTypeChange = (e) => {
        try {
            const newValue = e.target.value;
            UserDataService.updateUserData('substrateType', newValue);
            setUpdateTrigger(prev => prev + 1);
            checkFormCompletion({...userData, substrateType: newValue});
            
            LoggingService.info('User changed substrate type', { newValue });
            LoggingService.sendMetric('substrate_type_change', 1, { type: newValue });
        } catch (error) {
            LoggingService.logError(error, 'Error updating substrate type');
        }
    };
    
    const handleContainerSizeChange = (e) => {
        try {
            const value = parseFloat(e.target.value);
            UserDataService.updateUserData('containerSize', value);
            setUpdateTrigger(prev => prev + 1);
            checkFormCompletion({...userData, containerSize: value});
            
            LoggingService.debug('User changed container size', { value });
        } catch (error) {
            LoggingService.logError(error, 'Error updating container size');
        }
    };
    
    const handleSaveData = () => {
        try {
            const success = UserDataService.saveToLocalStorage();
            
            if (success) {
                LoggingService.info('User settings saved successfully');
                LoggingService.sendMetric('settings_save_success', 1);
                alert('Settings saved successfully!');
            } else {
                LoggingService.warning('Failed to save user settings');
                LoggingService.sendMetric('settings_save_failure', 1);
                alert('Failed to save settings');
            }
        } catch (error) {
            LoggingService.logError(error, 'Error saving user settings');
            alert('An error occurred while saving settings');
        }
    };
    
    const handleResetData = () => {
        if (window.confirm('Are you sure you want to reset to default values?')) {
            try {
                UserDataService.resetToDefaults();
                RecommendationService.resetRequestLimits(); // Reset API request limits
                setRecommendationsLoaded(false);
                setIsFormComplete(false);
                setHasLostFocus(false); // Reset the focus state as well
                setUpdateTrigger(prev => prev + 1);
                
                LoggingService.info('User reset data to defaults');
                LoggingService.sendMetric('settings_reset', 1);
            } catch (error) {
                LoggingService.logError(error, 'Error resetting data to defaults');
            }
        }
    };

    // Handle blur event for any input to check form completion
    const handleInputBlur = () => {
        checkFormCompletion(userData);
        setHasLostFocus(true);
        LoggingService.debug('User lost focus on input field, checking form completion');
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
                
                <div className="flex flex-col flex-grow">
                    {isFormComplete && recommendationsLoaded && hasLostFocus ? (
                        <RecommendationsPanel 
                            recommendations={recommendations} 
                            cultivationTips={MyceliumDataService.cultivationTips.slice(0, 6)} 
                            userData={userData}
                        />
                    ) : (
                        <MushroomFactsPanel />
                    )}
                    
                    {/* Substrate supplier links section */}
                    <SubstrateSupplierLinks />
                </div>
                
                {/* Temporarily hidden AI Cultivation Advisor */}
                {/* <AIAdvicePanel userData={userData} /> */}
            </div>
        </div>
    );
};

export default MyceliumMixCalculator;
