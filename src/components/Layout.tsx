import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { Link, Outlet, useMatch } from 'react-router-dom';
import { GROUPS, findGroup } from '../protocol';
import { Logo } from './Logo';

export function Layout() {
  const match = useMatch('/:group/*');
  const current = findGroup(match?.params.group)?.slug ?? false;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 'appBar',
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', columnGap: 3, flexWrap: 'wrap' }}>
          <Box
            component={Link}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, color: 'inherit', textDecoration: 'none' }}
          >
            <Logo />
            <Box>
              <Typography sx={{ fontWeight: 500, lineHeight: 1.25 }}>Interlude Hardcore</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.25 }}>
                Сетевой протокол
              </Typography>
            </Box>
          </Box>
          <Tabs value={current} variant="scrollable" scrollButtons="auto" sx={{ ml: 'auto', maxWidth: '100%' }}>
            {GROUPS.map((group) => (
              <Tab key={group.slug} value={group.slug} label={group.label} component={Link} to={`/${group.slug}`} />
            ))}
          </Tabs>
        </Container>
      </Box>
      <Container component="main" maxWidth="lg" sx={{ py: 3, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
