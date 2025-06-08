import {useState, useEffect} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

const Overview = ({ activePage, setActivePage }) => {
  const name = "kumar";
  const num = 10;
  const user = JSON.parse(localStorage.getItem("userInfo"));

  

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        flexDirection: "column",
        position: "relative",
        zIndex: 5,
      }}
    >
      <Box
        sx={{
          height: "100px",
          backgroundImage: "linear-gradient(to right, #6366f1, #4338ca)",
          color: "#fff",
          width: "60%",
          borderRadius: "8px",
          marginTop: "12px",
          display: "flex",
          flexDirection: "column",
          pt: 4,
          pl: 4,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "sans-serif",
            fontSize: 26,
            fontWeight: "bold",
          }}
        >
          {`Welcome back, DR.${user.name}`}
        </Typography>
        <Typography
          sx={{
            fontFamily: "sans-serif",
            fontWeight: "medium",
          }}
        >
          {`Here's an overview of the department events`}
        </Typography>
      </Box>

      <Box
        sx={{
          marginTop: 4,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr",
            lg: "1fr 1fr 1fr 1fr"
          },
        }}
      >
        <Box
          sx={{
            display:"flex",
            flexDirection:"column",
            pt: 2,
            pb: 4,
            pl: 2,
            pr: 2,
            mr: 2,
            mb: 4,
            boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.2)",
            borderRadius: "8px",
            width : {
              sm:370,
              md:320,
              lg:300,
            }
          }}
        >
          <Typography
            sx={{
              mb: 2,
              fontWeight: "large",
            }}
          >
            Total Proposals
          </Typography>
          <Box
            sx={{
              display: "flex",
              pl:4,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontSize="22px" fontWeight="600">
              {num}
            </Typography>
            <Box
              sx={{
                bgcolor: "rgb(68, 142, 216)",
                p: 1.5,
                borderRadius: "50%",
              }}
            >
              <DescriptionOutlinedIcon
                sx={{
                  color: "white",
                }}
              ></DescriptionOutlinedIcon>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            pt: 2,
            pb: 4,
            pl: 2,
            pr: 2,
            mb: 4,
            boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.2)",
            mr: 2,
            borderRadius: "8px",
            display:"flex",
            flexDirection:"column",
            width : {
              sm:370,
              md:320,
              lg:300,
            }
          }}
        >
          <Typography
            sx={{
              mb: 2,
              fontWeight: "large",
            }}
          >
            Approved Proposals
          </Typography>
          <Box
            sx={{
              display: "flex",pl:4,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontSize="22px" fontWeight="600">
              {num}
            </Typography>
            <Box
              sx={{
                bgcolor: "rgb(69, 225, 100)",
                p: 1,
                borderRadius: "50%",
              }}
            >
              <TaskAltOutlinedIcon
                sx={{
                  color: "white",
                  fontSize: 30,
                }}
              ></TaskAltOutlinedIcon>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            pt: 2,
            pb: 4,
            pl: 2,
            pr: 2,
            mb: 4,
            boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.2)",
            mr: 2,
            borderRadius: "8px",
            display:"flex",
            flexDirection:"column",
            width : {
              sm:370,
              md:320,
              lg:300,
            }
          }}
        >
          <Typography
            sx={{
              mb: 2,
              fontWeight: "large",
            }}
          >
            Pending Review
          </Typography>
          <Box
            sx={{
              display: "flex",pl:4,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontSize="22px" fontWeight="600">
              {num}
            </Typography>
            <Box
              sx={{
                bgcolor: "rgb(245 158 11)",
                p: 1,
                borderRadius: "50%",
              }}
            >
              <AccessTimeOutlinedIcon
                sx={{
                  color: "white",
                  fontSize: 30,
                }}
              ></AccessTimeOutlinedIcon>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            pt: 2,
            pb: 4,
            pl: 2,
            pr: 2,
            mb: 4,
            boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.2)",
            mr: 2,
            borderRadius: "8px",
            display:"felx",
            flexDirection:"column",
            width : {
              xs:410,
              sm:370,
              md:320,
              lg:300,
            }
          }}
        >
          <Typography
            sx={{
              mb: 2,
              fontWeight: "large",
            }}
          >
            Rejected Proposals
          </Typography>
          <Box
            sx={{
              display: "flex",
              pl:4,
              justifyContent: "space-between",
              alignItems: "center",
              
            }}
          >
            <Typography fontSize="22px" fontWeight="600" >
              {num}
            </Typography>
            <Box
              sx={{
                bgcolor: "rgb(216, 44, 44)",
                p: 1,
                borderRadius: "50%",
              }}
            >
              <HighlightOffIcon
                sx={{
                  color: "white",
                  fontSize: 30,
                }}
              ></HighlightOffIcon>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Overview;
