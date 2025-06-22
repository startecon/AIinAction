import * as React from 'react';
import { LanguageContext } from './LanguageContext';
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export const NotFound = (props) => {

    const navigate = useNavigate();
    const context = React.useContext(LanguageContext);

    const handleClose = () => {
        navigate("/");
    };

    return (
        <div style={{ height: "100vh", minHeight: 600 }}>
            <div style={{
                margin: 0,
                position: "absolute",
                top: "50%",
                left: "50%",
                msTransform: "translate(-50%, -50%)",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                
            }}>
                <Typography style={{ margin: 8 }} variant="h4" component="div">
                    {context.dictionary.NotFound.Title}
                </Typography>
                <Typography style={{ margin: 8 }} variant="subtitle1" component="div">
                    {context.dictionary.NotFound.Subtitle}
                </Typography>
                <Button variant="outlined" color="secondary" onClick={handleClose}>
                    {context.dictionary.NotFound.Continue}
                </Button>
            </div>
        </div>
    );
}
