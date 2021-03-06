import * as React from "react";
import { useHistory } from "react-router-dom";

import { Typography, Grid, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import { useSnackbar } from "notistack";
import Chip from "@material-ui/core/Chip";

import { UserContext } from "../contexts/user/UserContextProvider";
import ProfilePicLoader from "../components/ProfilePicLoader";

import { Formik, Form, Field } from "formik";
import { TextField } from "formik-material-ui";

const useStyles = makeStyles({
    profile: {
        margin: "2vh auto",
        marginTop: "10vh",
        width: "80%",
        paddingBottom: "5vh",
    },
    profileTopRight: {
        padding: "5vh 5vw 0 5vw",
    },
    profileTopLeft: {
        padding: "5vh 5vw 0 5vw",
        textAlign: "center",
    },
    userImage: {
        margin: "auto",
        border: "5px solid white",
        height: "15vw",
        width: "15vw",
        maxWidth: "18vh",
        maxHeight: "18vh",
    },
    allergyChip: {
        background: "#CCCC00",
        color: "white",
    },
});

export default function EditProfile() {
    const classes = useStyles();
    const history = useHistory();
    const user = React.useContext(UserContext);
    const userData = user.profile;

    const [cuisineChipData, setCuisineChipData] = React.useState(
        !userData.favoriteCuisine
            ? []
            : userData.favoriteCuisine.map((cuisine, index) => ({
                  key: index,
                  label: cuisine,
              }))
    );
    const [allergyChipData, setAllergyChipData] = React.useState(
        !userData.allergies
            ? ""
            : userData.allergies.map((allergy, index) => ({
                  key: index,
                  label: allergy,
              }))
    );

    const handleCuisineDelete = (chipToDelete) => () => {
        setCuisineChipData((chips) =>
            chips.filter((chip) => chip.key !== chipToDelete.key)
        );
    };
    const handleAllergenDelete = (chipToDelete) => () => {
        setAllergyChipData((chips) =>
            chips.filter((chip) => chip.key !== chipToDelete.key)
        );
    };

    const { enqueueSnackbar } = useSnackbar();

    const showSnackBar = (message, variant) => {
        enqueueSnackbar(message, { variant: variant, autoHideDuration: "6000" });
    };

    return (
        <>
            <Formik
                initialValues={{
                    firstName: userData.firstName || "",
                    lastName: userData.lastName || "",
                    cuisine: "",
                    about: userData.bio || "",
                    allergy: "",
                    street: userData.primaryAddress["street"] || "",
                    city: userData.primaryAddress["city"] || "",
                    region: userData.primaryAddress["region"] || "",
                    country: userData.primaryAddress["country"] || "",
                }}
                onSubmit={(values, { setSubmitting }) => {
                    setSubmitting(false);

                    const editedVals = {
                        firstName: values.firstName,
                        lastName: values.lastName,
                        bio: values.about,
                        primaryAddress: {
                            street: values.street,
                            city: values.city,
                            region: values.region,
                            country: values.country,
                        },
                        favoriteCuisine: cuisineChipData.map(
                            (cuisine) => cuisine.label
                        ),
                        allergies: allergyChipData.map((allergen) => allergen.label),
                    };

                    user.updateUser(editedVals)
                        .then((res) => {
                            if (res.result) {
                                history.push("/profile");
                                showSnackBar("Successfully updated!", "success");
                            } else {
                                showSnackBar(res.message, "error");
                            }
                        })
                        .catch((error) => {
                            showSnackBar("Error while making request", "error");
                        });
                }}
            >
                {({ submitForm, isSubmitting, values }) => (
                    <Form>
                        <Box
                            component={Grid}
                            boxShadow={3}
                            container
                            className={classes.profile}
                        >
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                container
                                spacing={2}
                                alignContent="flex-start"
                                className={classes.profileTopLeft}
                            >
                                <Grid item xs={12}>
                                    <Box
                                        boxShadow={2}
                                        component={Avatar}
                                        src={user.profile.profilePicURL}
                                        alt={
                                            user.profile.profilePicURL
                                                ? "profile image"
                                                : ""
                                        }
                                        className={classes.userImage}
                                    />
                                    <Grid item xs={6} mb={2}>
                                        <ProfilePicLoader />
                                    </Grid>
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        fullWidth
                                        component={TextField}
                                        variant="outlined"
                                        name="firstName"
                                        type="text"
                                        label="First Name"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        fullWidth
                                        component={TextField}
                                        variant="outlined"
                                        name="lastName"
                                        type="text"
                                        label="Last Name"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        fullWidth
                                        component={TextField}
                                        variant="outlined"
                                        name="street"
                                        type="text"
                                        label="Street"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        fullWidth
                                        component={TextField}
                                        variant="outlined"
                                        name="city"
                                        type="text"
                                        label="City"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        fullWidth
                                        component={TextField}
                                        variant="outlined"
                                        name="region"
                                        type="text"
                                        label="Province/State"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        fullWidth
                                        component={TextField}
                                        variant="outlined"
                                        name="country"
                                        type="text"
                                        label="Country"
                                    />
                                </Grid>
                            </Grid>

                            <Grid
                                item
                                xs={12}
                                sm={6}
                                container
                                spacing={2}
                                alignContent="flex-start"
                                className={classes.profileTopRight}
                            >
                                <Grid item xs={12}>
                                    <Typography variant="h6" component="h4">
                                        ABOUT ME:
                                    </Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <Field
                                        fullWidth
                                        component={TextField}
                                        multiline
                                        rowsMax={4}
                                        variant="outlined"
                                        name="about"
                                        type="text"
                                        label="About Me"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h6" component="h4">
                                        FAVOURITE CUISINE:
                                    </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Field
                                        fullWidth
                                        component={TextField}
                                        variant="outlined"
                                        name="cuisine"
                                        type="text"
                                        label="Cuisine Name"
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <Button
                                        className={classes.cuisineButton}
                                        color="primary"
                                        variant="outlined"
                                        onClick={() =>
                                            setCuisineChipData([
                                                ...cuisineChipData,
                                                {
                                                    key: [cuisineChipData.size],
                                                    label: values.cuisine,
                                                },
                                            ])
                                        }
                                    >
                                        Add Cuisine
                                    </Button>
                                </Grid>
                                <Grid item xs={12}>
                                    {cuisineChipData.map((data) => {
                                        return (
                                            <Chip
                                                color="primary"
                                                key={data.key}
                                                label={data.label}
                                                onDelete={handleCuisineDelete(data)}
                                                className={classes.chip}
                                            />
                                        );
                                    })}
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h6" component="h4">
                                        ALLERGIES
                                    </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Field
                                        fullWidth
                                        component={TextField}
                                        variant="outlined"
                                        name="allergy"
                                        type="text"
                                        label="Allergen"
                                    />
                                </Grid>

                                <Grid item xs={4}>
                                    <Button
                                        className={classes.cuisineButton}
                                        color="primary"
                                        variant="outlined"
                                        onClick={() =>
                                            setAllergyChipData([
                                                ...allergyChipData,
                                                {
                                                    key: [allergyChipData.size],
                                                    label: values.allergy,
                                                },
                                            ])
                                        }
                                    >
                                        Add Allergen
                                    </Button>
                                </Grid>
                                <Grid item xs={12}>
                                    {!allergyChipData
                                        ? ""
                                        : allergyChipData.map((data) => {
                                              return (
                                                  <Chip
                                                      key={data.key}
                                                      label={data.label}
                                                      onDelete={handleAllergenDelete(
                                                          data
                                                      )}
                                                      className={classes.allergyChip}
                                                  />
                                              );
                                          })}
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        disabled={isSubmitting}
                                        onClick={submitForm}
                                        color="primary"
                                        variant="contained"
                                    >
                                        <Typography variant="h5">
                                            SUBMIT CHANGES
                                        </Typography>
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Form>
                )}
            </Formik>
        </>
    );
}
