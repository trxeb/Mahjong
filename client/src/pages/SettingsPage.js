import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import './SettingsPage.css';

const SettingsPage = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        baseWin: 1,
        selfDraw: 1,
        allPungs: 2,
        pureSuit: 8,
        allHonors: 8,
        basePoints: 10,
        maxTai: 8,
        flowerBonus: 1,
        kongBonus: 1,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!user) return;
            const settingsRef = doc(db, 'userSettings', user.uid);
            const docSnap = await getDoc(settingsRef);
            if (docSnap.exists()) {
                setSettings(docSnap.data());
            }
            setLoading(false);
        };
        fetchSettings();
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        const settingsRef = doc(db, 'userSettings', user.uid);
        await setDoc(settingsRef, settings);
        setSaving(false);
        alert('Settings saved!');
    };

    if (loading) {
        return <Container className="text-center py-5"><Spinner>Loading...</Spinner></Container>;
    }

    return (
        <div className="settings-background">
            <Container className="py-5">
                <Card className="settings-card">
                    <CardBody>
                        <h2 className="mb-4 settings-header">
                            <i className="fa-solid fa-gear"></i> Settings
                        </h2>
                        <Form onSubmit={handleSave}>
                            <Row>
                                <Col md={6}>
                                    <h4 className="settings-subheader">Tai Value Configuration</h4>
                                    <FormGroup>
                                        <Label for="baseWin">平胡 (Basic Win)</Label>
                                        <Input type="number" name="baseWin" id="baseWin" value={settings.baseWin} onChange={handleInputChange} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="selfDraw">自摸 (Self Draw)</Label>
                                        <Input type="number" name="selfDraw" id="selfDraw" value={settings.selfDraw} onChange={handleInputChange} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="allPungs">對對胡 (All Pungs)</Label>
                                        <Input type="number" name="allPungs" id="allPungs" value={settings.allPungs} onChange={handleInputChange} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="pureSuit">清一色 (Pure Suit)</Label>
                                        <Input type="number" name="pureSuit" id="pureSuit" value={settings.pureSuit} onChange={handleInputChange} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="allHonors">字一色 (All Honors)</Label>
                                        <Input type="number" name="allHonors" id="allHonors" value={settings.allHonors} onChange={handleInputChange} />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <h4 className="settings-subheader">Game Preferences</h4>
                                    <FormGroup>
                                        <Label for="basePoints">Base Points</Label>
                                        <Input type="number" name="basePoints" id="basePoints" value={settings.basePoints} onChange={handleInputChange} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="maxTai">Maximum Tai</Label>
                                        <Input type="number" name="maxTai" id="maxTai" value={settings.maxTai} onChange={handleInputChange} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="flowerBonus">Flower Bonus</Label>
                                        <Input type="number" name="flowerBonus" id="flowerBonus" value={settings.flowerBonus} onChange={handleInputChange} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="kongBonus">Kong Bonus</Label>
                                        <Input type="number" name="kongBonus" id="kongBonus" value={settings.kongBonus} onChange={handleInputChange} />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Button className="btn-save-settings" type="submit" disabled={saving}>
                                <FontAwesomeIcon icon={faSave} className="me-2" />
                                {saving ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </Form>
                    </CardBody>
                </Card>
            </Container>
        </div>
    );
};

export default SettingsPage; 