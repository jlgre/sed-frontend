import React, { useState } from 'react';
import propTypes from 'prop-types';
import {
  Modal,
  ModalVariant,
  ActionGroup,
  Button,
} from '@patternfly/react-core';
import { useQueryClient } from 'react-query';
import useAddAdditionalRepositories from '../../hooks/useAddAdditionalRepositories';
import useNotifications from '../../hooks/useNotifications';
import AddAdditionalRepositoriesTable from '../AddAdditionalRepositoriesTable';

const AddAdditionalRepositoriesModal = (props) => {
  const {
    keyName,
    handleModalToggle: parentHandleModalToggle,
    isOpen,
    repositories,
    isLoading: additionalRepositoriesAreLoading,
    error: additionalRepositoriesError,
  } = props;

  const queryClient = useQueryClient();

  const [selectedRepositories, setSelectedRepositories] = useState([]);

  const handleModalToggle = () => {
    setSelectedRepositories([]);
    parentHandleModalToggle();
  };

  const { addSuccessNotification, addErrorNotification } = useNotifications();

  const { mutate } = useAddAdditionalRepositories();

  const submitForm = () => {
    mutate(
      { selectedRepositories, keyName },
      {
        onSuccess: () => {
          queryClient.resetQueries(`activation_key_${keyName}`);
          queryClient.resetQueries(
            `activation_key_${keyName}_available_repositories`
          );
          addSuccessNotification(
            `Repositories have been added for '${keyName}'`
          );
        },
        onError: () => {
          addErrorNotification('Something went wrong', {
            description:
              'Your repositories could not be added. Please try again.',
          });
        },
      }
    );
  };

  const editAdditionalRepositoriesDescription =
    'The core repositories for your operating system version, for example BaseOS and AppStream, are always enabled and do not need to be explicitly added to the activation key.';

  const editChangesButtons = (
    <ActionGroup>
      <Button
        key="Save changes"
        variant="primary"
        onClick={() => {
          submitForm();
          handleModalToggle();
        }}
        isDisabled={selectedRepositories.length === 0}
      >
        Save changes
      </Button>
      <Button key="cancel" variant="link" onClick={handleModalToggle}>
        Cancel
      </Button>
    </ActionGroup>
  );

  return (
    <React.Fragment>
      <Modal
        variant={ModalVariant.large}
        title="Add repositories"
        description={editAdditionalRepositoriesDescription}
        isOpen={isOpen}
        onClose={handleModalToggle}
        footer={editChangesButtons}
      >
        <AddAdditionalRepositoriesTable
          repositories={repositories}
          isLoading={additionalRepositoriesAreLoading}
          error={additionalRepositoriesError}
          selectedRepositories={selectedRepositories}
          setSelectedRepositories={setSelectedRepositories}
        />
      </Modal>
    </React.Fragment>
  );
};

AddAdditionalRepositoriesModal.propTypes = {
  keyName: propTypes.string,
  handleModalToggle: propTypes.func.isRequired,
  isOpen: propTypes.bool.isRequired,
  repositories: propTypes.array,
  isLoading: propTypes.func,
  error: propTypes.func,
};

export default AddAdditionalRepositoriesModal;
