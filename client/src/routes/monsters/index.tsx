
import { 
  Alert,
  SimpleGrid,
} from '@mantine/core';
import useGetMonsters from './useGetMonsters';
import { BiError, BiInfoCircle } from 'react-icons/bi';
import classes from '../../css/Nav.module.css';

function Monsters() {
  const { monsters, error } = useGetMonsters();
  
  return (
    <>
      {error && (
        <Alert 
          className={classes['margin-bottom-1']}
          variant="light" 
          color="red" 
          title="Error" 
          icon={
            <BiError 
              size="1rem" 
              stroke={1.5} 
            />
          }
        >
          {error}
        </Alert>
      )}

      <SimpleGrid
        cols={{ base: 1, sm: 2, lg: 5 }}
        spacing={{ base: 10, sm: 'xl' }}
        verticalSpacing={{ base: 'md', sm: 'xl' }}
      >
      {monsters && monsters.length > 0 ? monsters.map((monster) => (
        <div key={monster.id}>
          {monster.name}
        </div>
      )) : (
        <Alert 
          className={classes['margin-bottom-1']}
          variant="light" 
          color="indigo" 
          title="Note" 
          icon={
            <BiInfoCircle 
              size="1rem" 
              stroke={1.5} 
            />
          }
        >
          No monsters added yet
        </Alert>
      )}
      </SimpleGrid>
    </>
  );
}

export default Monsters;
