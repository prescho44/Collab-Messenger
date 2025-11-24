import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';

const AddMemberDialog = ({
  open,
  onClose,
  newMember,
  setNewMember,
  allUsers,
  members,
  handleAddMember,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Member</DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
          <InputLabel>Select Member</InputLabel>
          <Select
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            required
            sx={{
              backgroundColor: 'gray.600',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'teal',
                },
                '&:hover fieldset': {
                  borderColor: 'teal',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'teal',
                },
              },
            }}
          >
            {allUsers
              .filter((user) => !members.includes(user))
              .map((user) => (
                <MenuItem key={user} value={user}>
                  {user}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAddMember} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberDialog;