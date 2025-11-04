    /* ====== Viewport Height Fix for Mobile Safari ====== */
    function setViewportHeight() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);

    /* ====== Dynamic Data ====== */
    const invitationData = {
      guestName: "ស្វាមី និង ភរិយា",
      guestNameEnglish: "Mr. & Mrs. Example"
    };

    function loadContent() {
      const nameTag = document.getElementById('tag_name_list');
      if (nameTag && invitationData.guestName) {
        nameTag.textContent = invitationData.guestName;
      }
    }

    /* ====== Transition Logic ====== */
    document.addEventListener('DOMContentLoaded', () => {
      loadContent();

      const unlockContainer = document.getElementById('content-overlay');
      const heroHeader = document.getElementById('hero-header');
      const khmerInviteSection = document.getElementById('khmer-invite');
      const mobileWrapper = document.getElementById('mobile-wrapper');

      if (unlockContainer && heroHeader && khmerInviteSection && mobileWrapper) {
        mobileWrapper.style.overflowY = 'hidden';

        unlockContainer.addEventListener('click', () => {
          heroHeader.style.opacity = '0';
          heroHeader.style.height = '0';
          mobileWrapper.style.overflowY = 'hidden';

          setTimeout(() => {
            heroHeader.style.display = 'none';
            khmerInviteSection.style.opacity = '1';
            khmerInviteSection.style.transform = 'translateY(0)';
            mobileWrapper.style.overflowY = 'auto';
            khmerInviteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 1000);
        });
      } else {
        console.error("Error: Missing one or more elements for transition.");
      }
    });