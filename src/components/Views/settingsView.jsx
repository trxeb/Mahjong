// src/components/Views/SettingsView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import appStyles from '../../styles/appStyles'; // Import the shared styles
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; // Firebase Firestore: Added setDoc

const SettingsView = ({ currentPlayer }) => {
    // Get Firestore instance using the global app context
    const firestore = getFirestore();

    const [loadingSettings, setLoadingSettings] = useState(true);
    const [fetchError, setFetchError] = useState(null); // New state for fetch errors
    const [saveError, setSaveError] = useState(null);   // New state for save errors

    // Default Tai values for demonstration. These will be overwritten by fetched user settings.
    const [defaultTaiValue, setDefaultTaiValue] = useState(2); // Default Tai for Common Hand
    const [taiValuesConfig, setTaiValuesConfig] = useState({
        "All Honor (字一色)": 64,
        "Big Dragons (大三元)": 32,
        "Four Winds (大四喜)": 32,
        "Pure Hand (清一色)": 16,
        "Mixed Hand (混一色)": 8,
        "All Triplets (對對胡)": 4,
        "Common Hand (平胡)": 2,
    });
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    // Fetch user-specific settings from Firestore
    useEffect(() => {
        const fetchSettings = async () => {
            if (!currentPlayer || !currentPlayer.id) {
                // If no current player, can't fetch settings. Display appropriate message.
                setLoadingSettings(false);
                setFetchError(null); // Clear previous errors
                return;
            }

            setLoadingSettings(true);
            setFetchError(null); // Clear previous errors
            setSaveError(null); // Clear save errors on new fetch attempt

            try {
                const profileDocRef = doc(firestore, 'profiles', currentPlayer.id);
                const profileDoc = await getDoc(profileDocRef);

                if (profileDoc.exists()) {
                    const data = profileDoc.data();
                    console.log("Fetched profile data for settings:", data);

                    // Check if 'settings' field exists and contains 'taiValuesConfig' and 'defaultTaiValue'
                    if (data.settings) {
                        if (data.settings.taiValuesConfig) {
                            setTaiValuesConfig(data.settings.taiValuesConfig);
                        }
                        if (data.settings.defaultTaiValue !== undefined) {
                            setDefaultTaiValue(data.settings.defaultTaiValue);
                        }
                    }
                    console.log("Settings loaded from Firestore.");
                } else {
                    console.warn(`Profile document for ${currentPlayer.id} does not exist. Initializing default settings.`);
                    // If profile doesn't exist, it means the trigger or signup process didn't create it.
                    // This scenario should ideally be prevented or handled at signup.
                    // For now, we will try to set default settings if the profile exists but settings field doesn't.
                    // The saveSettings function will create the settings field if it's missing.
                }
            } catch (error) {
                console.error("Error fetching settings from Firestore:", error);
                setFetchError(`Failed to load settings: ${error.message}. Check console for details.`);
            } finally {
                setLoadingSettings(false);
            }
        };

        fetchSettings();
        // Dependency array: Re-run when currentPlayer changes (user logs in/out) or firestore instance changes.
    }, [currentPlayer, firestore]);

    // Handle changes to individual Tai values
    const handleTaiChange = (handType, value) => {
        const parsedValue = parseInt(value, 10);
        setTaiValuesConfig(prev => ({
            ...prev,
            [handType]: isNaN(parsedValue) ? 0 : Math.max(0, parsedValue) // Ensure it's a non-negative number
        }));
    };

    // Handle changes to the default Tai value
    const handleDefaultTaiChange = (value) => {
        const parsedValue = parseInt(value, 10);
        setDefaultTaiValue(isNaN(parsedValue) ? 1 : Math.max(1, parsedValue)); // Ensure it's at least 1 for default
    };

    // Save settings to Firestore
    const saveSettings = async () => {
        if (!currentPlayer || !currentPlayer.id) {
            setSaveError("Please log in to save settings.");
            return;
        }

        setLoadingSettings(true);
        setSaveError(null); // Clear previous save errors

        try {
            const profileDocRef = doc(firestore, 'profiles', currentPlayer.id);

            // Fetch the current profile to merge, or create if it doesn't exist
            const profileDoc = await getDoc(profileDocRef);

            if (!profileDoc.exists()) {
                // If profile document doesn't exist, create it with initial settings
                // This scenario should ideally be handled at user signup.
                // Added email and created_at fields for basic profile structure.
                await setDoc(profileDocRef, {
                    user_id: currentPlayer.id,
                    username: currentPlayer.username || 'Unknown User', // Fallback for username
                    email: currentPlayer.email || '', // Assuming email is available from currentPlayer if needed
                    wins: 0,
                    losses: 0,
                    total_tai: 0,
                    created_at: new Date(),
                    settings: {
                        defaultTaiValue: defaultTaiValue,
                        taiValuesConfig: taiValuesConfig
                    }
                });
                console.log("Profile created and settings saved.");
            } else {
                // If profile exists, just update the settings field
                await updateDoc(profileDocRef, {
                    settings: {
                        defaultTaiValue: defaultTaiValue,
                        taiValuesConfig: taiValuesConfig
                    }
                });
                console.log("Settings updated in existing profile.");
            }

            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 3000); // Hide success message after 3 seconds

        } catch (error) {
            console.error("Error saving settings to Firestore:", error);
            setSaveError(`Failed to save settings: ${error.message}. Check console for details.`);
        } finally {
            setLoadingSettings(false);
        }
    };

    // --- Conditional Rendering for Loading/Error States ---
    if (loadingSettings) {
        return (
            <div style={{ ...appStyles.screen, ...appStyles.screenActive }}>
                <div style={appStyles.centerContent}>
                    <p style={appStyles.welcomeTitle}>Loading Settings...</p>
                </div>
            </div>
        );
    }

    if (!currentPlayer) {
        return (
            <div style={{ ...appStyles.screen, ...appStyles.screenActive }}>
                <div style={appStyles.centerContent}>
                    <p style={appStyles.welcomeTitle}>Please log in to manage settings.</p>
                </div>
            </div>
        );
    }

    // --- Main Settings View Content ---
    return (
        <div style={{ ...appStyles.screen, ...appStyles.screenActive }}>
            <div style={appStyles.centerContent}>
                <div style={appStyles.welcomeSection}>
                    <div style={appStyles.welcomeTitle}>Tai Settings</div>
                    <div style={appStyles.welcomeSubtitle}>Customize tai values for different hand types.</div>
                </div>

                {fetchError && (
                    <div style={appStyles.errorMessage}>
                        <p>{fetchError}</p>
                    </div>
                )}
                {saveError && (
                    <div style={appStyles.errorMessage}>
                        <p>{saveError}</p>
                    </div>
                )}

                <div style={{ ...appStyles.card, maxWidth: 'unset', width: '100%' }}>
                    <h3 style={{ color: appStyles.inputGroupLabel.color, marginBottom: '20px', textAlign: 'center' }}>Default Tai Values</h3>

                    <div style={appStyles.inputGroup}>
                        <label htmlFor="defaultCommonTai" style={appStyles.inputGroupLabel}>Common Hand (平胡) Default Tai:</label>
                        <input
                            type="number"
                            id="defaultCommonTai"
                            value={defaultTaiValue}
                            onChange={(e) => handleDefaultTaiChange(e.target.value)}
                            min="1"
                            style={appStyles.inputGroupInput}
                        />
                    </div>

                    <h3 style={{ color: appStyles.inputGroupLabel.color, margin: '30px 0 20px', textAlign: 'center' }}>Custom Hand Tai Values</h3>
                    {Object.entries(taiValuesConfig).map(([handType, tai]) => (
                        <div key={handType} style={appStyles.inputGroup}>
                            <label htmlFor={`tai-${handType}`} style={appStyles.inputGroupLabel}>{handType}:</label>
                            <input
                                type="number"
                                id={`tai-${handType}`}
                                value={tai}
                                onChange={(e) => handleTaiChange(handType, e.target.value)}
                                min="0" // Allow 0 tai
                                style={appStyles.inputGroupInput}
                            />
                        </div>
                    ))}

                    <div style={{ textAlign: 'center', marginTop: '30px' }}>
                        <button style={appStyles.btn} onClick={saveSettings} disabled={loadingSettings}>
                            Save Settings
                        </button>
                        {showSaveSuccess && (
                            <p style={{ ...appStyles.inputGroupLabel, color: 'green', marginTop: '10px' }}>Settings saved successfully!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
