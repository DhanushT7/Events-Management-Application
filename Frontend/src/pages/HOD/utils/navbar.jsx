import React from 'react'
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';
import TemporaryDrawer from './drawer' 

const NavbarHod = ({activePage, setActivePage, onRefresh}) => {

  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  return (
    <Box 
      sx={{
        margin:"2px 2px 2px 0px",
        borderRadius:"8px",
        padding:"6px",
        boxShadow:'0px 2px 12px rgba(0, 0, 0, 0.2)',
        display:"flex",
        alignItems:"center",
        justifyContent:"space-between",
        position:"sticky",
      }}
      
    > 
      <Box sx={{display: "flex", alignItems: "center"}}>
        <Box sx={{ml:1, mr:1}}>
          <IconButton
            onClick={toggleDrawer(true)}
          >
            <MenuIcon></MenuIcon>
          </IconButton>
        </Box>

        <Typography
          fontFamily="sans-serif"
          fontSize="20px"
          fontWeight="medium"
          marginLeft="6px"
        >HOD Dashboard</Typography>
      </Box>

      {/* Refresh Button - only show on finance and finalBudget pages */}
      {(activePage === "finance" || activePage === "finalBudget") && onRefresh && (
        <Box sx={{mr: 2}}>
          <IconButton
            onClick={onRefresh}
            title="Refresh Data"
            sx={{
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white',
              }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      )}

      <TemporaryDrawer 
        open={open} 
        onClose={toggleDrawer(false)}
        activePage={activePage}
        setActivePage={setActivePage}
      >
      </TemporaryDrawer>

    </Box>
  )
}

export default NavbarHod;