import React from "react";
import { Form, FormField, TextInput, Box, Button } from "grommet";
import { UserAdmin } from "grommet-icons";
import { useAuth } from "./Auth";
import { useHistory, useLocation } from "react-router-dom";


const LoginForm = ({ props }) => {
    const [value, setValue] = React.useState({ login: '', password: '' });
    const [isLogin, setIsLogin] = React.useState(false);
    const history = useHistory();
    const location = useLocation();
    const auth = useAuth();
    const { from } = location.state || { from: { pathname: "/" } };

    return (
        <Box align="center" pad="xlarge">
            <Box border={{ size: "large", color: "brand" }} pad="xlarge">
                <Box align="center" justify="center" pad="medium">
                    <UserAdmin size="xlarge" color="brand" />
                </Box>
                <Form
                    value={value}
                    onChange={nextValue => setValue(nextValue)}
                    onReset={() => setValue({})}
                    onSubmit={async ({ value }) => {
                        setIsLogin(true);
                        console.log('Foo');
                        await auth.signin(value.login, value.password);
                        console.log("Hooooray");
                        setIsLogin(false);
                        history.replace(from);
                    }}
                >
                    <FormField name="login" label="Username" htmlFor="text-input-id" required>
                        <TextInput id="text-input-id" name="login" value={value.login} />
                    </FormField>
                    <FormField name="password" label="Password" htmlFor="passwword-input-id" required>
                        <TextInput id="password-input-id" name="password" type="password" value={value.password} />
                    </FormField>
                    <Box align="center" justify="center" direction="row" pad="xsmall" gap="medium">
                        <Button type="submit" primary label="Submit" disabled={isLogin} />
                        <Button type="reset" label="Reset" />
                    </Box>
                </Form>
            </Box>
        </Box>

    );
};

export default LoginForm;
